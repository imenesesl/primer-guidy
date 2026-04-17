#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOMEBREW_JAVA="/opt/homebrew/opt/openjdk/bin"
MAX_WAIT=90
EMULATOR_PID=""
EXIT_CODE=0

EMULATOR_PORTS=(9099 8080 4000)

if [ -d "$HOMEBREW_JAVA" ]; then
  export PATH="$HOMEBREW_JAVA:$PATH"
fi

kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  Killing PID(s) on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

wait_for_port() {
  local port="$1"
  local max="$2"
  for i in $(seq 1 "$max"); do
    if curl -sf "http://127.0.0.1:$port" > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

cleanup() {
  echo ""
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

echo "=== E2E Test Runner ==="
echo "App directory: $APP_DIR"
echo "Monorepo root: $MONOREPO_ROOT"

if ! command -v java &>/dev/null; then
  echo "ERROR: Java is required for Firebase Emulators but was not found."
  echo "Install Java or ensure it is in PATH."
  exit 1
fi
echo "Java: $(java -version 2>&1 | head -1)"

echo ""
echo "Cleaning up stale processes on emulator ports..."
for port in "${EMULATOR_PORTS[@]}"; do
  kill_port "$port"
done
sleep 3

echo ""
echo "Starting Firebase Emulators..."
cd "$MONOREPO_ROOT"
pnpm exec firebase emulators:start --only auth,firestore 2>&1 &
EMULATOR_PID=$!
echo "Emulator PID: $EMULATOR_PID"

echo "Waiting for Auth Emulator on port 9099 (up to ${MAX_WAIT}s)..."
if wait_for_port 9099 "$MAX_WAIT"; then
  echo "Auth Emulator ready."
else
  echo "ERROR: Auth Emulator failed to start within ${MAX_WAIT}s."
  echo "Emulator process status:"
  kill -0 "$EMULATOR_PID" 2>/dev/null && echo "  Process $EMULATOR_PID is still running" || echo "  Process $EMULATOR_PID has exited"
  exit 1
fi

echo "Waiting for Firestore Emulator on port 8080 (up to 30s)..."
if wait_for_port 8080 30; then
  echo "Firestore Emulator ready."
else
  echo "ERROR: Firestore Emulator failed to start within 30s."
  exit 1
fi

echo ""
echo "Running Playwright tests..."
cd "$APP_DIR"
pnpm exec playwright test --config e2e/playwright.config.ts || EXIT_CODE=$?

if [ "$EXIT_CODE" -ne 0 ]; then
  echo ""
  echo "Playwright tests FAILED with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
