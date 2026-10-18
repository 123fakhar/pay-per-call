# Application Rollback and Recovery Runbook — Assured Insurance Services

This document details the automated and manual rollback mechanisms, disaster recovery steps, and database backward-compatibility practices for the Assured Insurance Services platform.

---

## 1. Rollback Architecture Overview

Every deployment tracked by `scripts/deploy.sh` maintains image tracking state on the VPS in `/opt/assured`:

- `/opt/assured/current-image.txt`: The container image digest currently running.
- `/opt/assured/previous-image.txt`: The previous working container image digest.

```
       New Git Push
           │
           ▼
     deploy.sh Runs
           │
  Copies current -> previous
  Pulls new commit image
  Runs migrations with lock
  Restarts app & worker
           │
           ▼
    Health Check Loop
 (Polls /api/health/ready)
    ├── Passed (HTTP 200) ───────> Deployment Marked Success
    │
    └── Failed (20 retries) ─────> Triggers scripts/rollback.sh
                                          │
                                          ▼
                                   Reads previous-image.txt
                                   Restarts app & worker
                                   with previous image
```

---

## 2. Automated Health-Check Rollback

During a GitHub Actions deployment, `scripts/deploy.sh` polls `/api/health/ready` every 3 seconds for up to 60 seconds (20 retries).

If the endpoint does not report ready:
1. `scripts/deploy.sh` automatically invokes `scripts/rollback.sh`.
2. `scripts/rollback.sh` verifies `/opt/assured/previous-image.txt` exists.
3. It immediately pulls and restarts `app` and `worker` with the known-good previous image.
4. The GitHub Actions job exits with a failure code, alerting administrators that deployment failed and the previous image was restored.

---

## 3. Manual Rollback Procedure

If a bug or operational issue is discovered after a successful deployment, a manual rollback can be executed in seconds:

### Step 1: Connect to the VPS
```bash
ssh deploy@YOUR_VPS_IP
cd /opt/assured
```

### Step 2: Inspect Recorded Images
```bash
cat previous-image.txt
cat current-image.txt
```

### Step 3: Trigger Rollback Script
```bash
/bin/sh scripts/rollback.sh
```

**Expected output**:
```text
Rolling application back to ghcr.io/your-org/pay_per_call:<PREVIOUS_SHA>
[+] Running 2/2
 ✔ Container assured-app-1     Started
 ✔ Container assured-worker-1  Started
Database migrations are not reversed automatically. See docs/ROLLBACK.md.
```

### Step 4: Verify Health
```bash
curl -f http://127.0.0.1:3000/api/health/ready
```

---

## 4. Database Migrations and Backward Compatibility

> [!IMPORTANT]
> **Expand-and-Contract Principle**:
> Database schema migrations are **NOT** rolled back automatically by container restarts. Applying a destructive schema change will break older application versions.

To ensure safe zero-downtime rollbacks, follow these migration rules:

### A. Non-Breaking Schema Changes (Safe)
- Adding new nullable columns
- Adding new columns with default values
- Adding new tables
- Adding new indexes
*These changes are fully backward-compatible. If the new application version fails and rolls back, the old application version continues running without error.*

### B. Breaking Changes (Two-Phase Release Required)
If you need to rename a column or drop a field:
1. **Phase 1 (Expand)**: Add the new column alongside the old column. Deploy application code that writes to both columns and reads from the new column.
2. **Phase 2 (Contract)**: After verifying stability in production across several days, deploy a subsequent migration that safely removes the old unused column.

### C. Recovering from an Incompatible Migration
If a migration was applied that is incompatible with the previous application:
1. **Option A (Forward Fix - Recommended)**: Commit and push a corrective patch to `main`.
2. **Option B (Restore Pre-Deployment Backup)**: If data integrity is compromised, follow [docs/DATABASE_BACKUP_RESTORE.md](DATABASE_BACKUP_RESTORE.md) to restore the pre-migration snapshot taken prior to deployment.
