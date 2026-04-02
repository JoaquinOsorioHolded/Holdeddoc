#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# update-docs.sh — Update API documentation from OpenAPI spec files
#
# Usage:
#   ./scripts/update-docs.sh                          # Parse existing specs
#   ./scripts/update-docs.sh --en path/to/en.json     # Update EN spec + parse
#   ./scripts/update-docs.sh --es path/to/es.json     # Update ES spec + parse
#   ./scripts/update-docs.sh --en en.json --es es.json # Update both + parse
#   ./scripts/update-docs.sh --commit                  # Parse + auto-commit
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

EN_SPEC=""
ES_SPEC=""
AUTO_COMMIT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --en)
      EN_SPEC="$2"
      shift 2
      ;;
    --es)
      ES_SPEC="$2"
      shift 2
      ;;
    --commit)
      AUTO_COMMIT=true
      shift
      ;;
    *)
      echo "❌ Unknown option: $1"
      echo "Usage: $0 [--en path/to/en.json] [--es path/to/es.json] [--commit]"
      exit 1
      ;;
  esac
done

cd "$PROJECT_DIR"

# Copy new spec files if provided
if [[ -n "$EN_SPEC" ]]; then
  echo "📥 Copying EN spec from $EN_SPEC..."
  cp "$EN_SPEC" openapi-en.json
fi

if [[ -n "$ES_SPEC" ]]; then
  echo "📥 Copying ES spec from $ES_SPEC..."
  cp "$ES_SPEC" openapi-es.json
fi

# Verify at least one spec exists
if [[ ! -f openapi-en.json ]] && [[ ! -f openapi-es.json ]]; then
  echo "❌ No OpenAPI spec files found. Provide at least openapi-en.json or openapi-es.json"
  exit 1
fi

# Run parser
echo ""
echo "🔄 Parsing OpenAPI specs..."
npx tsx scripts/parse-openapi.ts

# Show diff summary
echo ""
echo "📊 Changes:"
git diff --stat src/data/ 2>/dev/null || echo "   (no git changes detected)"

# Auto-commit if requested
if [[ "$AUTO_COMMIT" == true ]]; then
  echo ""
  CHANGED=$(git diff --name-only src/data/ openapi-en.json openapi-es.json 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$CHANGED" -gt 0 ]]; then
    echo "📝 Committing changes..."
    git add openapi-en.json openapi-es.json src/data/
    DATE=$(date +%Y-%m-%d)
    git commit -m "docs: update API documentation ($DATE)"
    echo "✅ Committed!"
  else
    echo "ℹ️  No changes to commit."
  fi
fi

echo ""
echo "🎉 Documentation updated successfully!"
echo ""
echo "Next steps:"
echo "  1. git push           → Push to GitHub"
echo "  2. Vercel auto-deploys from main branch"
