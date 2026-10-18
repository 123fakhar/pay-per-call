#!/bin/sh
set -eu
INTERVAL=${BACKUP_INTERVAL_SECONDS:-86400}
while true; do
  /bin/sh /scripts/backup.sh || echo "backup_failed"
  sleep "$INTERVAL"
done
