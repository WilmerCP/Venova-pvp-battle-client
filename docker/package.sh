#!/usr/bin/env bash
set -euo pipefail

case "${1:-all}" in
  all) ;;
  windows) targets=(--win --x64 --ia32) ;;
  linux) targets=(--linux --x64) ;;
  *) echo 'Usage: docker compose run --rm build [all|windows|linux]. Build macOS on a macOS host with npm run build:mac.' >&2; exit 2 ;;
esac

# Build separately so Linux stays x64 and Windows includes both architectures.
if [[ "${1:-all}" == all ]]; then
  npx --no-install electron-builder --win --x64 --ia32 --publish never
  npx --no-install electron-builder --linux --x64 --publish never
else
  npx --no-install electron-builder "${targets[@]}" --publish never
fi
