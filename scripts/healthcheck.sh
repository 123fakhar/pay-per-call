#!/bin/sh
set -eu
BASE=${1:-http://127.0.0.1:3000}
wget -qO- "$BASE/api/health/live" >/dev/null
wget -qO- "$BASE/api/health/ready" >/dev/null
echo "health_ok"
