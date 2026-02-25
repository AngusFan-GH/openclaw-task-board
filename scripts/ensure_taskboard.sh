#!/usr/bin/env bash
set -euo pipefail

PLIST="/Users/angusfan/Library/LaunchAgents/com.openclaw.taskboard.plist"

if ! launchctl list | grep -q "com.openclaw.taskboard"; then
  launchctl load "$PLIST"
fi
