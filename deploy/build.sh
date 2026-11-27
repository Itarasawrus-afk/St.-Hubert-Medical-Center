#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
OUTPUT_DIR="$PROJECT_ROOT/deploy/site"

echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm ci

echo "Building production frontend..."
npm run build

echo "Preparing deployment package..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
cp -R "$FRONTEND_DIR/dist/." "$OUTPUT_DIR/"

if [ ! -f "$OUTPUT_DIR/index.html" ]; then
    echo "ERROR: Production index.html was not generated."
    exit 1
fi

echo "Static site successfully prepared in deploy/site/"