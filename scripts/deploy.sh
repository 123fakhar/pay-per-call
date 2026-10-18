#!/bin/sh
set -eu

ROOT=${DEPLOY_ROOT:-/opt/assured}
cd "$ROOT"

PREVIOUS_FILE="$ROOT/previous-image.txt"
CURRENT_FILE="$ROOT/current-image.txt"
IMAGE=${APP_IMAGE:?APP_IMAGE is required}

if [ -f "$CURRENT_FILE" ]; then
  cp "$CURRENT_FILE" "$PREVIOUS_FILE"
fi

echo "$IMAGE" > "$CURRENT_FILE"

export APP_IMAGE="$IMAGE"
export APP_VERSION="${APP_VERSION:-unknown}"
export GIT_SHA="${GIT_SHA:-unknown}"
export ENV_FILE="$ROOT/.env"

echo "Pulling $IMAGE"
docker pull "$IMAGE"

echo "Running migrations once"
docker compose -f compose.yaml run --rm --no-deps \
  -e DATABASE_MIGRATE_URL \
  -e APP_DB_USER \
  migrate node migrate.cjs || \
docker compose -f compose.yaml run --rm \
  app node migrate.cjs

# The migrate service is profiled; application image includes drizzle files.
# Fallback uses the app image entrypoint override.

echo "Starting services"
docker compose -f compose.yaml up -d postgres app worker caddy backup

ATTEMPTS=0
until wget -qO- http://127.0.0.1:3000/api/health/ready >/dev/null 2>&1 || docker compose -f compose.yaml exec -T app wget -qO- http://127.0.0.1:3000/api/health/ready >/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 20 ]; then
    echo "health check failed"
    /bin/sh "$ROOT/scripts/rollback.sh"
    exit 1
  fi
  sleep 3
done

echo "deploy_ok $IMAGE"
