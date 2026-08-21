#!/bin/sh
set -e

WWEB_AUTH_DIR="/usr/src/app/.wwebjs_auth"
BAILEYS_AUTH_DIR="/usr/src/app/.baileys_auth"

mkdir -p "$WWEB_AUTH_DIR" "$BAILEYS_AUTH_DIR"
chown -R node:node "$WWEB_AUTH_DIR" "$BAILEYS_AUTH_DIR" 2>/dev/null || true
chmod -R 775 "$WWEB_AUTH_DIR" "$BAILEYS_AUTH_DIR" 2>/dev/null || true

exec gosu node "$@"
