#!/usr/bin/env bash
set -euo pipefail

PROMPTS_FILE="${1:-}"
API_URL="${VALIDATE_URL:-http://localhost:3010/api/validate}"
CONCURRENCY="${CONCURRENCY:-5}"
RUN_DIR="./brain/$(date +%Y-%m-%d_%H-%M-%S)"
TMP_DIR="${RUN_DIR}/tmp"

if [ -z "$PROMPTS_FILE" ]; then
  echo "Usage: bash brain/run-validation.sh <prompts.json>"
  echo "  CONCURRENCY=10 bash brain/run-validation.sh brain/prompts/attack.json"
  exit 1
fi

if [ ! -f "$PROMPTS_FILE" ]; then
  echo "Error: file not found: ${PROMPTS_FILE}"
  exit 1
fi

PROMPTS=$(cat "$PROMPTS_FILE")
mkdir -p "$TMP_DIR"

TOTAL=$(echo "$PROMPTS" | jq 'length')
SUITE_NAME=$(basename "$PROMPTS_FILE" .json)

echo "=== Validation Run: $(date) ==="
echo "=== Suite: ${SUITE_NAME} ==="
echo "=== Endpoint: ${API_URL} ==="
echo "=== Total: ${TOTAL} prompts (concurrency: ${CONCURRENCY}) ==="
echo ""

run_one() {
  local i="$1"
  local entry
  entry=$(echo "$PROMPTS" | jq -c ".[$i]")
  local ctx
  ctx=$(echo "$entry" | jq -r '.context')
  local prm
  prm=$(echo "$entry" | jq -r '.prompt')

  local response
  response=$(curl -sf -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$entry" 2>&1) || response="{\"error\": \"request failed\"}"

  jq -n \
    --argjson idx "$i" \
    --arg ctx "$ctx" \
    --arg prm "$prm" \
    --argjson res "$response" \
    '{index: $idx, context: $ctx, prompt: $prm, response: $res}' > "${TMP_DIR}/${i}.json"

  local status
  status=$(echo "$response" | jq -r '.valid // .error // "unknown"' 2>/dev/null)
  echo "  [$(($i + 1))/${TOTAL}] done (${status}) — ${prm:0:50}..."
}

export -f run_one
export API_URL PROMPTS TMP_DIR TOTAL

seq 0 $((TOTAL - 1)) | xargs -P "$CONCURRENCY" -I {} bash -c 'run_one "$@"' _ {}

echo ""
echo "=== Merging results ==="

jq -s 'sort_by(.index)' "${TMP_DIR}"/*.json > "${RUN_DIR}/results.json"
cp "$PROMPTS_FILE" "${RUN_DIR}/prompts-source.json"
rm -rf "$TMP_DIR"

RESULTS_FILE="${RUN_DIR}/results.json"
VALID=$(jq '[.[] | select(.response.valid == true)] | length' "$RESULTS_FILE")
INVALID=$(jq '[.[] | select(.response.valid == false)] | length' "$RESULTS_FILE")
ERRORS=$(jq '[.[] | select(.response.error != null and .response.valid == null)] | length' "$RESULTS_FILE")

echo "=== Done ==="
echo "=== Results: ${RESULTS_FILE} ==="
echo "=== Total: ${TOTAL} | Valid: ${VALID} | Rejected: ${INVALID} | Errors: ${ERRORS} ==="
