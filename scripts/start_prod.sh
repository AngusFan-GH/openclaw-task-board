#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/Users/angusfan/Documents/xzinfra/projects/openclaw-task-board"
PORT="3000"

cd "$APP_DIR"

# install deps if missing
if [ ! -d node_modules ]; then
  npm install
fi

# build if missing
if [ ! -d .next ]; then
  npm run build
fi

# start server
npm run start -- -p "$PORT"
