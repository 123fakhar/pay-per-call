# Database Backup and Disaster Recovery Runbook — Assured Insurance Services

This runbook defines the automated backup architecture, integrity verification protocols, offsite replication strategy, and step-by-step restoration procedures for the PostgreSQL database.

---

## 1. Backup Architecture Overview

```
 ┌─────────────────┐       pg_dump        ┌─────────────────┐
 │   PostgreSQL    │ ───────────────────> │  backup-loop.sh │ (Runs in 'backup' container)
 │    Container    │                      │   every 24 hrs  │
 └─────────────────┘                      └────────┬────────┘
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        │                                                     │
               gzip -9 + sha256                                     Optional S3 Replication
                        │                                                     │
                        ▼                                                     ▼
              ┌──────────────────┐                                  ┌──────────────────┐
              │  /backups local  │                                  │  Encrypted S3 /  │
              │  Docker volume   │                                  │  Cloudflare R2   │
              │  (14-day prune)  │                                  │  (Off-host copy) │
              └──────────────────┘                                  └──────────────────┘
```

The backup routine is encapsulated in the `backup` container defined in `compose.yaml`:
- **Image**: `postgres:16.8-alpine3.21`
- **Volume**: `backup_local` mounted at `/backups`
- **Script**: `scripts/backup.sh` triggered automatically by `scripts/backup-loop.sh`
- **Schedule**: Every 86,400 seconds (24 hours), configurable via `BACKUP_INTERVAL_SECONDS`.

---

## 2. Backup Integrity and Verification Process

Every backup run executes the following operations in sequence:

1. **Dump Creation**: `pg_dump --no-owner --format=plain` writes the SQL dump to a temporary file.
2. **Compression**: The dump is compressed using maximum gzip compression (`gzip -9`).
3. **Checksum Generation**: A SHA-256 checksum is calculated and written to `<filename>.sha256`.
4. **Offsite Upload**: If `BACKUP_S3_BUCKET` is configured, both the compressed dump and its `.sha256` checksum are uploaded to the S3 bucket using server-side encryption (`--sse AES256`).
5. **Self-Verification Before Pruning**:
   - `gzip -t <archive>` tests the gzip archive integrity.
   - `sha256sum -c <checksum>` validates that the file matches its checksum.
   - **Critical Rule**: Old backups exceeding `BACKUP_RETENTION_DAYS` (default 14 days) are **ONLY** pruned if the newest backup passes both integrity checks. If verification fails, pruning is aborted and the process exits with an error.

---

## 3. Manual On-Demand Backup

To create an immediate backup (e.g. before applying a manual migration or major upgrade):

```bash
cd /opt/assured
docker compose exec -T backup /bin/sh /scripts/backup.sh
```

**Expected output**:
```text
backup_ok /backups/assured-20261016T220000Z.sql.gz
```

Verify the new backup file exists and matches its checksum:
```bash
docker compose exec -T backup ls -la /backups
```

---

## 4. Offsite Storage Configuration (S3 / Cloudflare R2)

To protect against total VPS loss, configure an offsite storage bucket in `/opt/assured/.env`:

```ini
BACKUP_S3_BUCKET=assured-insurance-database-backups
```

Ensure AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`) are either:
- Exported in the environment of the VPS host, or
- Configured via an IAM instance profile / attached Cloudflare R2 credentials.

---

## 5. Step-by-Step Restoration Procedure

> [!WARNING]
> Restoring a database dump is destructive to current data. Existing tables and records will be overwritten. Always take an emergency backup of the current database before running a restore.

### Step 1: Place Application in Maintenance Mode
Stop the frontend and worker services so no concurrent transactions occur during restore:

```bash
cd /opt/assured
docker compose stop app worker
```

### Step 2: Identify the Target Backup Archive
List available backup archives in the local volume:

```bash
docker compose exec -T backup ls -la /backups
```

Identify the desired archive name, for example:
`/backups/assured-20261016T220000Z.sql.gz`

If restoring from offsite S3, download the archive first:
```bash
docker compose exec -T backup aws s3 cp s3://YOUR_BUCKET/STAMP/assured-STAMP.sql.gz /backups/
docker compose exec -T backup aws s3 cp s3://YOUR_BUCKET/STAMP/assured-STAMP.sql.gz.sha256 /backups/
```

### Step 3: Run the Restoration Script
Execute `scripts/restore.sh` inside the `backup` container:

```bash
docker compose exec -T backup /bin/sh /scripts/restore.sh /backups/assured-20261016T220000Z.sql.gz
```

**What the script does automatically**:
1. Verifies that the `.sha256` checksum matches.
2. Runs `gzip -t` to confirm archive integrity.
3. Streams the decompressed SQL statements into `psql` with `-v ON_ERROR_STOP=1`.

**Expected output**:
```text
Restoring /backups/assured-20261016T220000Z.sql.gz into assured. This overwrites objects in the target database.
...
restore_ok
```

### Step 4: Restart Application Services and Verify Health
```bash
docker compose up -d app worker
```

Verify service readiness:
```bash
curl -f http://127.0.0.1:3000/api/health/ready
```

**Expected JSON response**:
```json
{"status":"ready","database":"ok","version":"1.0.0","emailOutboxFailed":0}
```

Check the administrator application portal at `https://affiliates.yourdomain.com/admin/applications` to verify that application records and email statuses are present.
