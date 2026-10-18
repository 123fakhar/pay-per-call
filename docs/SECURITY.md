# Security and Hardening Guide — Assured Insurance Services

This document details the security architecture, VPS hardening checklist, database isolation rules, application abuse prevention mechanisms, and credential rotation procedures for the Assured Insurance Services platform.

---

## 1. VPS Hardening Checklist

Follow this checklist when provisioning or verifying any production VPS host:

- [x] **Supported LTS Release**: Ubuntu 22.04 LTS or 24.04 LTS.
- [x] **SSH Key Authentication Only**: Disable password-based SSH authentication after confirming key access.
  ```bash
  # In /etc/ssh/sshd_config.d/50-cloud-init.conf or /etc/ssh/sshd_config
  PasswordAuthentication no
  KbdInteractiveAuthentication no
  PubkeyAuthentication yes
  ```
- [x] **Disable Direct Root Login**:
  ```bash
  PermitRootLogin no
  ```
  Restart SSH: `sudo systemctl restart ssh` or `sudo systemctl restart sshd`.
- [x] **Firewall Ingress Rules (UFW)**:
  - Port 22 (SSH)
  - Port 80 (HTTP for ACME challenges and automatic redirect)
  - Port 443 (HTTPS for web traffic)
  - **All other ports (including 5432, 3000) are blocked from external ingress.**
- [x] **Automated Security Updates**: Enable `unattended-upgrades`:
  ```bash
  sudo apt-get install -y unattended-upgrades
  sudo dpkg-reconfigure --priority=low unattended-upgrades
  ```
- [x] **Brute-Force Protection**: Enable `fail2ban` for SSH:
  ```bash
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```
- [x] **Restrictive Environment File Permissions**:
  ```bash
  chmod 600 /opt/assured/.env
  chown deploy:deploy /opt/assured/.env
  ```

---

## 2. Network and Database Isolation

### Private Docker Networking
All inter-container communication occurs across an isolated internal Docker bridge network (`internal`):
```yaml
networks:
  internal:
    driver: bridge
    internal: false
```

- PostgreSQL (`postgres`) does **NOT** publish port 5432 to the host network.
- The database is only addressable by internal Docker DNS (`postgres:5432`) from within the same Compose project.
- Outside internet scans cannot detect or connect to PostgreSQL.

### Least-Privilege Dual Database Users
The platform separates schema modification from routine runtime operations:

1. **Migration User (`assured_migrator`)**:
   - Holds table creation, schema DDL, and index modification rights.
   - Used exclusively during automated migration runs (`docker compose run migrate node migrate.cjs`).
   - Connection URL: `DATABASE_MIGRATE_URL`.

2. **Application User (`assured_app`)**:
   - Provisioned via `docker/postgres/init-app-user.sh` and `lib/db/migrate.ts`.
   - Granted **ONLY** DML privileges:
     ```sql
     GRANT USAGE ON SCHEMA public TO "assured_app";
     GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "assured_app";
     GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "assured_app";
     ```
   - Cannot drop tables, alter schemas, grant permissions, or access administrative PostgreSQL functions.
   - Connection URL: `DATABASE_URL`.

---

## 3. Container Security Controls

- **Non-Root Execution**: The production Next.js runtime image runs under a dedicated, unprivileged user:
  ```dockerfile
  RUN addgroup -S assured && adduser -S assured -G assured
  USER assured
  ```
- **No New Privileges**: In `compose.yaml`, all application services enforce:
  ```yaml
  security_opt:
    - no-new-privileges:true
  ```
- **Resource Constraints**: CPU and memory limits are explicitly configured on every service to prevent denial-of-service starvation:
  - `app`: `memory: 768M`
  - `postgres`: `memory: 512M`
  - `worker`: `memory: 256M`
  - `caddy`: `memory: 256M`
  - `backup`: `memory: 256M`
- **Minimal Image Surface**: Alpine-based minimal distributions (`node:22-alpine`, `postgres:16-alpine`, `caddy:alpine`). Development packages, compilers, and test suites are excluded from runner stages.

---

## 4. Application Security and Abuse Prevention

### Form Spam Protection
1. **Honeypot Trap (`websiteFax`)**:
   - Hidden offscreen field invisible to normal users.
   - Any submission containing content in this field is rejected immediately with HTTP 400.
2. **Velocity Threshold (`formStartedAt`)**:
   - Rejects submissions completed in under 3 seconds (`isTooFast`), mitigating headless bot submissions.
3. **Database-Backed Rate Limiting**:
   - Records hashed IP identifiers in `submission_rate_events`.
   - Submissions exceeding `SUBMIT_RATE_LIMIT` (default 5) within `SUBMIT_RATE_WINDOW_MS` (default 15 minutes) receive HTTP 429 Too Many Requests.
   - Submitter IP addresses are hashed using SHA-256 with a private secret salt (`RATE_LIMIT_SALT`) to preserve privacy while enabling rate enforcement.
4. **CSRF & Origin Validation**:
   - All mutation endpoints (`/api/applications`, `/api/admin/*`) verify `isSameOrigin(request)` by comparing request `Origin` and `Referer` headers against the application host.
5. **Reverse Proxy Internal Path Blocking**:
   - In `Caddyfile`, direct access to `/api/internal*` from the internet is blocked with HTTP 404:
     ```caddy
     @internal path /api/internal*
     respond @internal 404
     ```

---

## 5. Session and Cookie Hardening

Administrator session tokens are signed JWTs with:
- `alg: HS256` using `SESSION_SECRET` (minimum 32 random characters).
- Explicit 8-hour expiration (`setExpirationTime("8h")`).
- Cookies configured with:
  - `HttpOnly: true` (prevents JavaScript access / XSS token exfiltration).
  - `SameSite: "strict"` (prevents cross-site request forgery).
  - `Secure: true` in production (enforces HTTPS transmission).
  - `Path: "/"`
- Constant-time string verification (`crypto.timingSafeEqual`) in `safeEqual` prevents timing-analysis password attacks.

---

## 6. HTTP Security Headers

Caddy and Next.js configure security headers on every response:
- **Strict-Transport-Security (HSTS)**: `max-age=31536000; includeSubDomains; preload`
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY` (prevents clickjacking)
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`
- **Server Header Stripped**: Caddy strips the `-Server` header to prevent server identification.

---

## 7. Credential Rotation Procedures

### Rotating Database Passwords
1. Generate new passwords for `POSTGRES_PASSWORD` and `APP_DB_PASSWORD`.
2. Connect to the running PostgreSQL container:
   ```bash
   docker compose exec postgres psql -U assured_migrator -d assured
   ```
3. Update role passwords:
   ```sql
   ALTER ROLE assured_migrator WITH PASSWORD 'NEW_MIGRATOR_PASSWORD';
   ALTER ROLE assured_app WITH PASSWORD 'NEW_APP_PASSWORD';
   ```
4. Update `/opt/assured/.env` with the new passwords.
5. Restart the application and worker:
   ```bash
   docker compose up -d --force-recreate app worker backup
   ```

### Rotating Admin Credentials or Session Secret
1. Update `ADMIN_PASSWORD` or `SESSION_SECRET` in `/opt/assured/.env`.
2. Restart the app container:
   ```bash
   docker compose restart app
   ```
3. Rotating `SESSION_SECRET` immediately invalidates all active administrator login sessions.

### Rotating SSH Deployment Keys
1. Generate a new keypair locally: `ssh-keygen -t ed25519 -f ~/.ssh/new_deploy_key`.
2. Append the public key to `/home/deploy/.ssh/authorized_keys` on the VPS.
3. Update the `VPS_SSH_KEY` secret in GitHub Repository Settings.
4. Verify GitHub Actions deploys successfully with the new key.
5. Remove the old public key from `/home/deploy/.ssh/authorized_keys`.
