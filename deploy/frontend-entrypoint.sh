#!/bin/sh
set -eu

CONFIG_FILE="/usr/share/nginx/html/assets/runtime-config.js"
API_BASE_URL="${API_BASE_URL:-/api/v1}"

case "$API_BASE_URL" in
  http://*|https://*|/api/*) ;;
  *)
    echo "API_BASE_URL must be an http(s) URL or an /api/... path." >&2
    exit 1
    ;;
esac

case "$API_BASE_URL" in
  *\"*|*\\*)
    echo "API_BASE_URL contains unsupported characters." >&2
    exit 1
    ;;
esac

cat > "$CONFIG_FILE" <<EOF
globalThis.__MARKET_CONFIG__ = {
  apiBaseUrl: "$API_BASE_URL"
};
EOF
