#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
V2_DIR="${SCRIPT_DIR}/v2"
API_URL="${VALIDATE_URL:-http://localhost:3010/api/process}"
API_KEY="${API_KEY:-dev-validation-key-2024}"
SKIP_SLOW="${SKIP_SLOW:-}"

if [ ! -d "$V2_DIR" ]; then
  echo "Error: v2 directory not found at ${V2_DIR}"
  exit 1
fi

DIRS=$(find "$V2_DIR" -maxdepth 1 -mindepth 1 -type d | sort)
TOTAL=$(echo "$DIRS" | wc -l | tr -d ' ')

echo "=== V2 Integration Tests: $(date) ==="
echo "=== Endpoint: ${API_URL} ==="
echo "=== Total: ${TOTAL} test cases ==="
echo ""

PASSED=0
FAILED=0
ERRORS=0

for DIR in $DIRS; do
  INTENTION="${DIR}/intention.json"
  if [ ! -f "$INTENTION" ]; then
    continue
  fi

  TEST_ID=$(jq -r '.id' "$INTENTION")
  TEST_DESC=$(jq -r '.description' "$INTENTION")
  REQUEST=$(jq -c '.request' "$INTENTION")

  if [ -n "$SKIP_SLOW" ] && echo "$TEST_ID" | grep -q "13-edge-max-students"; then
    echo "  SKIP ${TEST_ID} — ${TEST_DESC}"
    continue
  fi

  START_MS=$(python3 -c 'import time; print(int(time.time()*1000))')

  HTTP_CODE=$(curl -s -o "${DIR}/response-body.json" -w "%{http_code}" \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ${API_KEY}" \
    -d "$REQUEST" 2>/dev/null) || HTTP_CODE="000"

  END_MS=$(python3 -c 'import time; print(int(time.time()*1000))')
  DURATION_MS=$((END_MS - START_MS))

  RESPONSE_BODY=$(cat "${DIR}/response-body.json" 2>/dev/null || echo '{"error":"no response"}')

  EXPECTED_STATUS=$(jq -r '.expectation.httpStatus // 200' "$INTENTION")
  EXPECTED_VALID=$(jq -r '.expectation.valid // "null"' "$INTENTION")
  EXPECTED_REASON=$(jq -r '.expectation.expectedReason // "null"' "$INTENTION")
  EXPECTED_STUDENTS=$(jq -r '.expectation.studentCount // "null"' "$INTENTION")
  EXPECTED_QPE=$(jq -r '.expectation.questionsPerStudent // "null"' "$INTENTION")
  EXPECTED_HAS_REPLY=$(jq -r '.expectation.hasReply // "null"' "$INTENTION")
  EXPECTED_HAS_OPTIONS=$(jq -r '.expectation.hasOptions // "null"' "$INTENTION")
  EXPECTED_OPTIONS_COUNT=$(jq -r '.expectation.optionsCount // "null"' "$INTENTION")
  EXPECTED_HAS_HINTS=$(jq -r '.expectation.hasHints // "null"' "$INTENTION")

  ACTUAL_VALID=$(echo "$RESPONSE_BODY" | jq -r '.valid // "null"' 2>/dev/null)
  ACTUAL_REASON=$(echo "$RESPONSE_BODY" | jq -r '.error.reason // "null"' 2>/dev/null)
  ACTUAL_STUDENTS=$(echo "$RESPONSE_BODY" | jq -r 'if .studentContents then (.studentContents | length) else 0 end' 2>/dev/null || echo 0)
  ACTUAL_HAS_REPLY=$(echo "$RESPONSE_BODY" | jq -r 'if .reply and (.reply | length) > 0 then "true" else "false" end' 2>/dev/null)

  ASSERTIONS="[]"
  TEST_PASSED=true

  if [ "$EXPECTED_STATUS" != "null" ] && [ "$HTTP_CODE" != "$EXPECTED_STATUS" ]; then
    TEST_PASSED=false
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "httpStatus" --arg e "$EXPECTED_STATUS" --arg a "$HTTP_CODE" '. + [{"name":$n,"passed":false,"expected":$e,"actual":$a}]')
  else
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "httpStatus" --arg e "$EXPECTED_STATUS" --arg a "$HTTP_CODE" '. + [{"name":$n,"passed":true,"expected":$e,"actual":$a}]')
  fi

  if [ "$EXPECTED_VALID" != "null" ] && [ "$ACTUAL_VALID" != "$EXPECTED_VALID" ]; then
    TEST_PASSED=false
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "valid" --arg e "$EXPECTED_VALID" --arg a "$ACTUAL_VALID" '. + [{"name":$n,"passed":false,"expected":$e,"actual":$a}]')
  elif [ "$EXPECTED_VALID" != "null" ]; then
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "valid" --arg e "$EXPECTED_VALID" --arg a "$ACTUAL_VALID" '. + [{"name":$n,"passed":true,"expected":$e,"actual":$a}]')
  fi

  if [ "$EXPECTED_REASON" != "null" ] && [ "$ACTUAL_REASON" != "$EXPECTED_REASON" ]; then
    TEST_PASSED=false
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "expectedReason" --arg e "$EXPECTED_REASON" --arg a "$ACTUAL_REASON" '. + [{"name":$n,"passed":false,"expected":$e,"actual":$a}]')
  elif [ "$EXPECTED_REASON" != "null" ]; then
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "expectedReason" --arg e "$EXPECTED_REASON" --arg a "$ACTUAL_REASON" '. + [{"name":$n,"passed":true,"expected":$e,"actual":$a}]')
  fi

  if [ "$EXPECTED_HAS_REPLY" = "true" ] && [ "$ACTUAL_HAS_REPLY" != "true" ]; then
    TEST_PASSED=false
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "hasReply" '. + [{"name":$n,"passed":false,"expected":"true","actual":"false"}]')
  elif [ "$EXPECTED_HAS_REPLY" = "true" ]; then
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "hasReply" '. + [{"name":$n,"passed":true,"expected":"true","actual":"true"}]')
  fi

  if [ "$EXPECTED_STUDENTS" != "null" ] && [ "$ACTUAL_STUDENTS" != "$EXPECTED_STUDENTS" ]; then
    TEST_PASSED=false
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "studentCount" --arg e "$EXPECTED_STUDENTS" --arg a "$ACTUAL_STUDENTS" '. + [{"name":$n,"passed":false,"expected":$e,"actual":$a}]')
  elif [ "$EXPECTED_STUDENTS" != "null" ]; then
    ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "studentCount" --arg e "$EXPECTED_STUDENTS" --arg a "$ACTUAL_STUDENTS" '. + [{"name":$n,"passed":true,"expected":$e,"actual":$a}]')
  fi

  if [ "$EXPECTED_QPE" != "null" ] && [ "$ACTUAL_STUDENTS" != "0" ]; then
    ACTUAL_QPE=$(echo "$RESPONSE_BODY" | jq "[.studentContents[].questions | length] | unique | .[0] // 0" 2>/dev/null || echo 0)
    ALL_MATCH=$(echo "$RESPONSE_BODY" | jq --argjson e "$EXPECTED_QPE" '[.studentContents[].questions | length] | all(. <= $e)' 2>/dev/null || echo false)
    if [ "$ALL_MATCH" != "true" ]; then
      TEST_PASSED=false
      ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "questionsPerStudent" --arg e "$EXPECTED_QPE" --arg a "$ACTUAL_QPE" '. + [{"name":$n,"passed":false,"expected":$e,"actual":$a}]')
    else
      ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "questionsPerStudent" --arg e "$EXPECTED_QPE" --arg a "$ACTUAL_QPE" '. + [{"name":$n,"passed":true,"expected":$e,"actual":$a}]')
    fi
  fi

  if [ "$EXPECTED_OPTIONS_COUNT" != "null" ] && [ "$ACTUAL_STUDENTS" != "0" ]; then
    ALL_OPTIONS_OK=$(echo "$RESPONSE_BODY" | jq --argjson e "$EXPECTED_OPTIONS_COUNT" '[.studentContents[].questions[].options | length] | all(. == $e)' 2>/dev/null || echo false)
    if [ "$ALL_OPTIONS_OK" != "true" ]; then
      TEST_PASSED=false
      ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "optionsCount" --arg e "$EXPECTED_OPTIONS_COUNT" '. + [{"name":$n,"passed":false,"expected":$e,"actual":"mismatch"}]')
    else
      ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "optionsCount" --arg e "$EXPECTED_OPTIONS_COUNT" '. + [{"name":$n,"passed":true,"expected":$e,"actual":$e}]')
    fi
  fi

  if [ "$EXPECTED_HAS_HINTS" = "true" ] && [ "$ACTUAL_STUDENTS" != "0" ]; then
    ALL_HINTS_OK=$(echo "$RESPONSE_BODY" | jq '[.studentContents[].questions[].expectedAnswerHints | length] | all(. > 0)' 2>/dev/null || echo false)
    if [ "$ALL_HINTS_OK" != "true" ]; then
      TEST_PASSED=false
      ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "hasHints" '. + [{"name":$n,"passed":false,"expected":"true","actual":"false"}]')
    else
      ASSERTIONS=$(echo "$ASSERTIONS" | jq --arg n "hasHints" '. + [{"name":$n,"passed":true,"expected":"true","actual":"true"}]')
    fi
  fi

  if [ "$TEST_PASSED" = "true" ]; then
    ICON="✅"
    PASSED=$((PASSED + 1))
  else
    ICON="❌"
    FAILED=$((FAILED + 1))
  fi

  echo "  ${ICON} ${TEST_ID} — ${DURATION_MS}ms — ${TEST_DESC}"

  jq -n \
    --arg id "$TEST_ID" \
    --arg desc "$TEST_DESC" \
    --argjson req "$REQUEST" \
    --arg httpCode "$HTTP_CODE" \
    --argjson body "$RESPONSE_BODY" \
    --argjson dur "$DURATION_MS" \
    --argjson assertions "$ASSERTIONS" \
    --argjson passed "$TEST_PASSED" \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{
      id: $id,
      description: $desc,
      request: $req,
      response: { httpStatus: ($httpCode | tonumber), durationMs: $dur, body: $body },
      assertions: $assertions,
      passed: $passed,
      timestamp: $ts
    }' > "${DIR}/result.json"

  rm -f "${DIR}/response-body.json"
done

echo ""
echo "=== Summary: ${PASSED} passed, ${FAILED} failed, ${ERRORS} errors (of ${TOTAL}) ==="

jq -n \
  --argjson p "$PASSED" \
  --argjson f "$FAILED" \
  --argjson e "$ERRORS" \
  --argjson t "$TOTAL" \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{passed: $p, failed: $f, errors: $e, total: $t, timestamp: $ts}' > "${V2_DIR}/summary.json"

echo "=== Results saved in ${V2_DIR}/*/result.json ==="
echo "=== Summary saved in ${V2_DIR}/summary.json ==="

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
