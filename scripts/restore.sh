#!/bin/sh
set -eu

if [ "${1:-}" = "" ]; then
  echo "Usage: restore.sh /path/to/assured-YYYYMMDDThhmmssZ.sql.gz"
  exit 1
fi

ARCHIVE=$1
CHECKSUM="$ARCHIVE.sha256"

if [ ! -f "$ARCHIVE" ]; then
  echo "archive not found"
  exit 1
fi

if [ -f "$CHECKSUM" ]; then
  sha256sum -c "$CHECKSUM"
fi

gzip -t "$ARCHIVE"

echo "Restoring $ARCHIVE into $PGDATABASE. This overwrites objects in the target database."
gzip -dc "$ARCHIVE" | psql -v ON_ERROR_STOP=1
echo "restore_ok"
