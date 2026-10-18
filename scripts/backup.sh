#!/bin/sh
set -eu

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WORKDIR=${BACKUP_DIR:-/backups}
TMP="$WORKDIR/tmp-$STAMP.sql"
FILE="$WORKDIR/assured-$STAMP.sql.gz"
CHECKSUM="$FILE.sha256"

mkdir -p "$WORKDIR"
pg_dump --no-owner --format=plain --file="$TMP"
gzip -9 "$TMP"
mv "$TMP.gz" "$FILE"
sha256sum "$FILE" > "$CHECKSUM"

if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  if command -v aws >/dev/null 2>&1; then
    aws s3 cp "$FILE" "s3://$BACKUP_S3_BUCKET/$STAMP/$(basename "$FILE")" --sse AES256
    aws s3 cp "$CHECKSUM" "s3://$BACKUP_S3_BUCKET/$STAMP/$(basename "$CHECKSUM")" --sse AES256
  else
    echo "aws cli is not installed; local backup only: $FILE"
  fi
fi

# Retain local copies only after the newest backup verifies.
if gzip -t "$FILE" && sha256sum -c "$CHECKSUM" >/dev/null; then
  find "$WORKDIR" -name 'assured-*.sql.gz' -mtime +"${BACKUP_RETENTION_DAYS:-14}" -delete
  find "$WORKDIR" -name 'assured-*.sql.gz.sha256' -mtime +"${BACKUP_RETENTION_DAYS:-14}" -delete
else
  echo "backup verification failed; not pruning older files"
  exit 1
fi

echo "backup_ok $FILE"
