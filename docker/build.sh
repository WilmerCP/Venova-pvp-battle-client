#!/usr/bin/env bash
set -euo pipefail

case "${1:-all}" in
  all) ;;
  windows|linux) ;;
  *) echo 'Usage: bash docker/build.sh [all|windows|linux]. Build macOS on a macOS host with npm run build:mac.' >&2; exit 2 ;;
esac

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
exec docker compose --project-directory "$project_dir" --file "$project_dir/compose.yaml" run --build --rm build "${1:-all}"
