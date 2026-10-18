# Production Deployment Guide — Assured Insurance Services

This guide provides end-to-end instructions for deploying and operating the Assured Insurance Services Pay-Per-Call platform on a Linux Virtual Private Server (VPS) with automatic HTTPS, Docker containerization, and fully automated push-to-deploy GitHub Actions CI/CD.

---

## 1. Architectural Overview

```
                      Internet
                         │
                 ┌───────▼───────┐
                 │  Ports 80/443 │
                 │  Caddy Proxy  │  (Automatic Let's Encrypt TLS, HSTS, Security Headers)
                 └───────┬───────┘
                         │ Private Docker Network ('internal')
         ┌───────────────┼───────────────┐
         │               │               │
  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
  │ Next.js App │ │ Email Worker│ │  PostgreSQL │ (Port 5432 NOT exposed to host/internet)
  │ (Port 3000) │ │ (Outbox DML)│ │  (Persistent│
  └─────────────┘ └─────────────┘ │    Volume)  │
                                  └──────┬──────┘
                                  ┌──────▼──────┐
                                  │Backup Loop  │ (Daily dumps, SHA256, Gzip, S3 sync)
                                  └─────────────┘
```

The system is designed with strict isolation:
- Only **Caddy** binds to public ports 80 and 443.
- **PostgreSQL** is bound exclusively to the private Docker bridge network (`internal`) and has no host port bindings.
- Applications run under an unprivileged `assured` Linux user (UID/GID 10001).
- Outbox worker polls asynchronously; customer form submissions are never blocked by SMTP timeouts.

---

## 2. Prerequisites

1. **Linux VPS**: Ubuntu 22.04 LTS or 24.04 LTS (minimum 1 vCPU, 2GB RAM, 25GB SSD).
2. **Domain Name**: A registered domain or subdomain (e.g., `affiliates.assuredinsurance.com`).
3. **DNS Access**: Ability to create DNS `A` records pointing to your VPS IP address.
4. **Hostinger Mailbox**: An active mailbox created in Hostinger hPanel (e.g., `notifications@yourdomain.com`).
5. **GitHub Repository**: Admin access to your GitHub repository to configure repository secrets and actions.

---

## 3. Step 1: VPS Base Hardening & Docker Installation

SSH into your VPS as root or sudoer:

```bash
ssh root@YOUR_VPS_IP
```

### A. Update System Packages
```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl ufw fail2ban ca-certificates gnupg
```

### B. Create Dedicated Deployment Account
Do not run routine CI/CD deployments as `root`. Create a dedicated `deploy` user:

```bash
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy
```

### C. Install Docker Engine and Docker Compose
```bash
# Add Docker official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Grant deploy user Docker access
usermod -aG docker deploy
```

### D. Configure Firewall (UFW)
Expose only SSH, HTTP, and HTTPS:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP (Caddy Let\'s Encrypt verification)'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
ufw status verbose
```

*Note: PostgreSQL (5432) remains completely closed to external ingress.*

---

## 4. Step 2: SSH Key Setup for GitHub Actions

On your local machine, generate a dedicated ed25519 keypair for GitHub Actions CI/CD:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/assured_deploy_key
```

Add the public key to the `deploy` user on the VPS:

```bash
# On VPS as deploy user
su - deploy
mkdir -p ~/.ssh && chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste contents of ~/.ssh/assured_deploy_key.pub
chmod 600 ~/.ssh/authorized_keys
```

Verify key authentication from your local machine:
```bash
ssh -i ~/.ssh/assured_deploy_key deploy@YOUR_VPS_IP
```

---

## 5. Step 3: VPS Directory Structure and Production Configuration

On the VPS, create the application root directory `/opt/assured`:

```bash
sudo mkdir -p /opt/assured/scripts
sudo mkdir -p /opt/assured/docker/postgres
sudo chown -R deploy:deploy /opt/assured
```

Clone or copy the repository deployment files into `/opt/assured`:
- `compose.yaml`
- `Caddyfile`
- `scripts/` (deploy.sh, rollback.sh, backup.sh, restore.sh, backup-loop.sh)
- `docker/postgres/init-app-user.sh`

Ensure execution permissions on scripts:
```bash
chmod +x /opt/assured/scripts/*.sh
chmod +x /opt/assured/docker/postgres/*.sh
```

### Create `/opt/assured/.env`
Copy `.env.example` to `/opt/assured/.env` and populate with production values:

```bash
cp .env.example /opt/assured/.env
chmod 600 /opt/assured/.env
nano /opt/assured/.env
```

**Key Values to Populate in `/opt/assured/.env`:**
```ini
APP_DOMAIN=affiliates.yourdomain.com
TLS_EMAIL=admin@yourdomain.com
POSTGRES_DB=assured
POSTGRES_USER=assured_migrator
POSTGRES_PASSWORD=<STRONG_RANDOM_PASSWORD_FOR_MIGRATOR>
APP_DB_USER=assured_app
APP_DB_PASSWORD=<STRONG_RANDOM_PASSWORD_FOR_APP>
DATABASE_URL=postgres://assured_app:<STRONG_RANDOM_PASSWORD_FOR_APP>@postgres:5432/assured
DATABASE_MIGRATE_URL=postgres://assured_migrator:<STRONG_RANDOM_PASSWORD_FOR_MIGRATOR>@postgres:5432/assured
ADMIN_EMAIL=justin.bennett@assuredinsuranceservices.com
ADMIN_PASSWORD=<STRONG_RANDOM_ADMIN_PASSWORD>
SESSION_SECRET=<GENERATE_WITH_openssl_rand_-base64_48>
RATE_LIMIT_SALT=<GENERATE_WITH_openssl_rand_-hex_24>
GMAIL_ONLY_REGISTRATION=false
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=notifications@yourdomain.com
SMTP_PASS=<HOSTINGER_MAILBOX_PASSWORD>
MAIL_FROM="Assured Insurance Services" <notifications@yourdomain.com>
```

---

## 6. Step 4: Configure DNS Records

In your DNS provider (e.g. Cloudflare, Namecheap, Hostinger DNS):

| Type | Name | Content / Value | TTL | Proxy Status |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `affiliates` | `YOUR_VPS_IP` | Automatic / 300 | DNS Only (Grey Cloud if using Cloudflare) |

*Important: If using Cloudflare, set proxy to "DNS Only" initially so Caddy can perform the ACME HTTP-01 challenge directly to issue Let's Encrypt certificates.*

---

## 7. Step 5: GitHub Secrets Configuration

In your GitHub repository, navigate to **Settings > Secrets and variables > Actions > New repository secret**.

Add the following repository secrets:

1. `VPS_HOST`: Your VPS IP address (e.g. `198.51.100.25`).
2. `VPS_USER`: `deploy`
3. `VPS_SSH_KEY`: The entire contents of `~/.ssh/assured_deploy_key` (including `-----BEGIN OPENSSH PRIVATE KEY-----` and trailing newline).
4. `VPS_KNOWN_HOSTS`: The output of `ssh-keyscan -H YOUR_VPS_IP`.
5. `GHCR_PAT`: (Optional for public repositories; required if private) A Personal Access Token with `read:packages` permission so the VPS can pull images from GHCR.

---

## 8. Step 6: Initial Bootstrap on VPS

Before the first push, initialize the database and ensure the services can communicate:

```bash
cd /opt/assured

# Pull database image and start PostgreSQL
docker compose up -d postgres

# Verify postgres is healthy
docker compose ps
# Wait until postgres status shows "(healthy)"
```

---

## 9. Step 7: Push-to-Deploy Automated Workflow

From this point on, deployment is 100% automated:

1. Make edits in your local IDE / Cursor.
2. Run tests locally if desired:
   ```bash
   npm run typecheck
   npm run test
   ```
3. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "feat: enhance affiliate portal"
   git push origin main
   ```
4. **GitHub Actions automatically**:
   - Executes ESLint, TypeScript check (`tsc --noEmit`), and all 32 Vitest tests.
   - Builds the production Next.js application and worker bundle.
   - Packages an immutable Docker image tagged with the commit SHA and `latest`.
   - Publishes the image to GitHub Container Registry (`ghcr.io/...`).
   - Connects securely to the VPS via SSH.
   - Pulls the exact commit image digest.
   - Runs database migrations once with an advisory lock.
   - Gracefully restarts `app`, `worker`, `caddy`, and `backup`.
   - Polls `/api/health/ready` until verified healthy.
   - If health check fails within 60 seconds, automatically triggers `scripts/rollback.sh` to revert to the previous working image.

---

## 10. Operational Inspection and Maintenance Commands

### Check Service Status
```bash
cd /opt/assured
docker compose ps
```

### Inspect Live Application Logs
```bash
docker compose logs -f --tail=100 app
```

### Inspect Background Email Worker Logs
```bash
docker compose logs -f --tail=100 worker
```

### Inspect Caddy Access & TLS Logs
```bash
docker compose logs -f --tail=100 caddy
```

### Inspect Backup Service Logs
```bash
docker compose logs -f --tail=100 backup
```

### Manual Trigger of Database Backup
```bash
docker compose exec -T backup /bin/sh /scripts/backup.sh
```

### Inspect Local Database Backups
```bash
docker compose exec -T backup ls -la /backups
```
