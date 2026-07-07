#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRADLE_PROPS="$ROOT_DIR/android/gradle.properties"
PREVIEW_GRADLE_BACKUP=""

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

restore_gradle_properties() {
  if [[ -n "$PREVIEW_GRADLE_BACKUP" && -f "$PREVIEW_GRADLE_BACKUP" ]]; then
    mv "$PREVIEW_GRADLE_BACKUP" "$GRADLE_PROPS"
  fi
}

configure_preview_gradle() {
  [[ -f "$GRADLE_PROPS" ]] || return 0

  PREVIEW_GRADLE_BACKUP="$(mktemp)"
  cp "$GRADLE_PROPS" "$PREVIEW_GRADLE_BACKUP"
  trap restore_gradle_properties EXIT

  sed -i '' \
    -e 's/^org.gradle.jvmargs=.*/org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError/' \
    -e 's/^reactNativeArchitectures=.*/reactNativeArchitectures=arm64-v8a/' \
    "$GRADLE_PROPS"

  # Pick up the new JVM heap settings on the next Gradle invocation.
  (cd "$ROOT_DIR/android" && ./gradlew --stop >/dev/null 2>&1) || true
}

configure_preview_gradle

# Local release APK (preview-style). Same toolchain as `pnpm android`, but release variant.
pnpm exec expo run:android --variant release --no-bundler "$@"

echo ""
echo "Preview APK: android/app/build/outputs/apk/release/app-release.apk"
