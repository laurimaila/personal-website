#!/bin/sh
set -e

# Next.js bakes NEXT_PUBLIC_* vars into JS at build time, I added this so
# e.g. backend's public URL can be set during runtime in different environments
# without sacrificing static building.
replace() {
  local placeholder="$1"
  local value="$2"
  if [ -n "$value" ]; then
    find /app/.next -type f -name "*.js" -exec sed -i "s|${placeholder}|${value}|g" {} +
  fi
}

replace "__PLACEHOLDER_BACKEND_URL__" "$NEXT_PUBLIC_BACKEND_URL"
replace "__PLACEHOLDER_BASE_URL__"    "$NEXT_PUBLIC_BASE_URL"

exec node server.js
