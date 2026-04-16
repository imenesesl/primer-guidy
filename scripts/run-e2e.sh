#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOMEBREW_JAVA="/opt/homebrew/opt/openjdk/bin"
MAX_WAIT=30

if [ -d "$HOMEBREW_JAVA" ]; then
  export PATH="$HOMEBREW_JAVA:$PATH"
fi

# Kill any stale emulator processes
lsof -ti :9099 | xargs kill -9 2>/dev/null || true
lsof -ti :8080 | xargs kill -9 2>/dev/null || true
lsof -ti :4000 | xargs kill -9 2>/dev/null || true
sleep 1

cleanup() {
  echo "Shutting down emulators..."
  kill "$EMULATOR_PID" 2>/dev/null || true
  wait "$EMULATOR_PID" 2>/dev/null || true
  lsof -ti :8080 | xargs kill -9 2>/dev/null || true
}

trap cleanup EXIT

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
    echo "Emulators failed to start."
    exit 1
  fi
  sleep 1
done

echo "Running Playwright tests..."
cd "$APP_DIR"
pnpm exec playwright test --config e2e/playwright.config.ts
