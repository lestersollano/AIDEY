#!/usr/bin/env bash
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# Local release APK (preview-style). Same toolchain as `pnpm android`, but release variant.
pnpm exec expo run:android --variant release --no-bundler "$@"

echo ""
echo "Preview APK: android/app/build/outputs/apk/release/app-release.apk"
