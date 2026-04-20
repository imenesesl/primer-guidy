#!/usr/bin/env bash
set -euo pipefail

OLLAMA_HOST="${OLLAMA_BASE_URL:-http://localhost:11434}"
GUARD_MODEL="${GUARD_MODEL:-llama-guard3:8b}"
CURATION_MODEL="${CURATION_MODEL:-llama3.1:8b}"
GENERATION_MODEL="${OLLAMA_MODEL:-llama3.1:8b}"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "Waiting for Ollama at ${OLLAMA_HOST}..."

for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf "${OLLAMA_HOST}/api/tags" > /dev/null 2>&1; then
    echo "Ollama is ready."
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "Ollama did not become ready after $((MAX_RETRIES * RETRY_INTERVAL))s. Exiting."
    exit 1
  fi
  sleep $RETRY_INTERVAL
done

pull_model() {
  local model="$1"
  echo "Pulling model: ${model}..."
  curl -sf "${OLLAMA_HOST}/api/pull" -d "{\"name\": \"${model}\"}" | while IFS= read -r line; do
    status=$(echo "$line" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$status" ]; then
      printf "\r  [%s] %s" "$model" "$status"
    fi
  done
  echo ""
  echo "Model ${model} is ready."
}

MODELS=("$GUARD_MODEL" "$CURATION_MODEL" "$GENERATION_MODEL")
UNIQUE_MODELS=($(printf '%s\n' "${MODELS[@]}" | sort -u))

for model in "${UNIQUE_MODELS[@]}"; do
  pull_model "$model"
done

echo ""
echo "All models are ready:"
for model in "${UNIQUE_MODELS[@]}"; do
  echo "  - ${model}"
done
