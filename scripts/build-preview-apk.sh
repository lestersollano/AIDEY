#!/usr/bin/env bash
set -euo pipefail

# Builds a preview APK via EAS Build (see eas.json "preview" profile).
# Pass extra flags through to eas, e.g. `pnpm android:preview -- --local`.
exec pnpm exec eas build --profile preview --platform android "$@"
