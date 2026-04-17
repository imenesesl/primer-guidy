#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOMEBREW_JAVA="/opt/homebrew/opt/openjdk/bin"
MAX_WAIT=60
EMULATOR_PID=""

EMULATOR_PORTS=(9099 8080 4000)

if [ -d "$HOMEBREW_JAVA" ]; then
  export PATH="$HOMEBREW_JAVA:$PATH"
fi

kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

cleanup() {
  echo "Shutting down emulators..."
  if [ -n "$EMULATOR_PID" ]; then
    kill "$EMULATOR_PID" 2>/dev/null || true
    wait "$EMULATOR_PID" 2>/dev/null || true
  fi
  for port in "${EMULATOR_PORTS[@]}"; do
    kill_port "$port"
  done
}

trap cleanup EXIT

for port in "${EMULATOR_PORTS[@]}"; do
  kill_port "$port"
done
sleep 2

echo "Starting Firebase Emulators..."
cd "$MONOREPO_ROOT"
pnpm exec firebase emulators:start --only auth,firestore &
EMULATOR_PID=$!

echo "Waiting for Auth Emulator on port 9099..."
for i in $(seq 1 $MAX_WAIT); do
  if curl -sf http://127.0.0.1:9099 > /dev/null 2>&1; then
    echo "Emulators ready."
    break
  fi
  if [ "$i" -eq "$MAX_WAIT" ]; then
    echo "Emulators failed to start within ${MAX_WAIT}s."
    exit 1
  fi
  sleep 1
done

echo "Running Playwright tests..."
cd "$APP_DIR"
pnpm exec playwright test --config e2e/playwright.config.ts
