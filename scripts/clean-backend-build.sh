#!/usr/bin/env bash
# Remove artefatos de build do backend (inclui pastas criadas como root pelo Docker).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT/backend/build"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Nada a limpar em backend/build"
  exit 0
fi

if [[ -w "$BUILD_DIR" ]]; then
  rm -rf "$BUILD_DIR"
  echo "backend/build removido."
else
  echo "backend/build pertence ao root (comum após 'docker compose --profile test')."
  echo "Execute:"
  echo "  sudo rm -rf $BUILD_DIR"
fi
