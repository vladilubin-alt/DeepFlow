#!/usr/bin/env bash
set -euo pipefail

# DeepFlow — Apply RLS Policies to Supabase
# Usage: ./apply_rls.sh
# Requires: SUPABASE_ACCESS_TOKEN in .env (root) or environment

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$PROJECT_ROOT/.env" 2>/dev/null || true

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "ERROR: SUPABASE_ACCESS_TOKEN not set. Add it to .env or export it."
  exit 1
fi

PROJECT_REF="cmqvyikiotltnmsiyhzv"
SQL_FILE="$PROJECT_ROOT/supabase/migrations/001_enable_rls.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "ERROR: $SQL_FILE not found."
  exit 1
fi

SQL=$(cat "$SQL_FILE")

echo "Applying RLS policies to Supabase project $PROJECT_REF..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg q "$SQL" '{query: $q}')")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ RLS policies applied successfully."
else
  echo "❌ Failed (HTTP $HTTP_CODE):"
  echo "$BODY"
  exit 1
fi

echo ""
echo "Verifying RLS is enabled..."
curl -s -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/profiles?limit=1" | head -c 200
echo ""
echo "Done."
