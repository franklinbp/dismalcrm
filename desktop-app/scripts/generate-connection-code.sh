#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso:"
  echo "  $0 <frontend_url> [backend_url] [nombre_negocio]"
  echo ""
  echo "Ejemplo:"
  echo "  $0 https://dismal.vip https://dismal.vip \"DismalCRM\""
  exit 1
fi

FRONTEND_URL="$1"
BACKEND_URL="${2:-}"
NAME="${3:-}"

JSON_PAYLOAD="$(node -e 'const [appUrl, backendUrl, name] = process.argv.slice(1); process.stdout.write(JSON.stringify({ appUrl, backendUrl, name }));' "$FRONTEND_URL" "$BACKEND_URL" "$NAME")"
ENCODED="$(printf "%s" "$JSON_PAYLOAD" | base64 -w0)"

echo "Codigo de conexion:"
echo "DCRM1-$ENCODED"
