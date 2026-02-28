#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$SCRIPT_DIR/cli.js"
EXAMPLES_DIR="$SCRIPT_DIR/../examples"

for md in "$EXAMPLES_DIR"/*.md; do
  echo "=== Build: $(basename "$md") ==="
  node "$CLI" pdf "$md"
done
