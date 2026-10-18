#!/bin/sh
set -eu
ROOT=${DEPLOY_ROOT:-/opt/assured}
cd "$ROOT"
PREVIOUS_FILE="$ROOT/previous-image.txt"
if [ ! -f "$PREVIOUS_FILE" ]; then
  echo "No previous image recorded; cannot roll back automatically."
  exit 1
fi
export APP_IMAGE
APP_IMAGE=$(cat "$PREVIOUS_FILE")
echo "Rolling application back to $APP_IMAGE"
docker pull "$APP_IMAGE" || true
docker compose -f compose.yaml up -d app worker
echo "Database migrations are not reversed automatically. See docs/ROLLBACK.md."
