# Assured Insurance Services — Pay-Per-Call Production Platform

A production-ready, security-hardened Pay-Per-Call affiliate onboarding and application management platform built for **Assured Insurance Services**.

Combines a classical luxury aesthetic (midnight black, charcoal, ivory, and restrained antique gold) with modern financial technology, transactional email outbox reliability, private container networking, automated database backups, and push-to-deploy GitHub Actions CI/CD to a Linux VPS with automatic Let's Encrypt HTTPS and health-check rollbacks.

---

## 1. Company Information & Verticals

- **Company**: Assured Insurance Services
- **Address**:
  ```text
  2440 SE FEDERAL HWY
  SUITE 111
  STUART, FL 34994
  ```
- **Administrator Notification Recipient**: `justin.bennett@assuredinsuranceservices.com`
- **Applicant Receipt Confirmation**: Sent directly to the applicant's validated submitted email address.
- **Campaign Verticals**:
  1. **Medicare**
  2. **Final Expense**
  3. **Auto Insurance**
  4. **Home Services**
  5. **Legal**

> [!NOTE]
> **Regulatory Notice**: Assured Insurance Services is an independent performance marketing and pay-per-call partnership firm. It is not a government agency, is not affiliated with Medicare, Medicaid, or any official public program, and does not provide guaranteed call volumes, revenue promises, or insurance licenses.

---

## 2. Technology Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) 16.4.2 (App Router, Turbopack, Partial Prefetching, Cache Components, React 19).
- **Styling & Design System**: Tailwind CSS v4, Cormorant Garamond serif headers, Source Sans 3 body copy, Lucide icons, Sonner toast notifications.
- **Animations**: GSAP timeline animations with explicit `prefers-reduced-motion` accessibility support.
- **Form Architecture**: React Hook Form with Zod validation, reproducing the field structure of the DMS Everflow reference (General, Company, Address, Additional Info, Traffic Details, Monthly Earnings, References, Channels, Experience, Referral, Relationship context, and Terms consent).
- **Abuse Prevention**: Honeypot detection (`websiteFax`), submission velocity checking (`formStartedAt`), and salted IP rate-limiting in PostgreSQL.
- **Database**: PostgreSQL 16 on an isolated private Docker bridge network. Version-controlled migrations via Drizzle ORM with advisory locking (`pg_advisory_lock`). Least-privilege application role separation (`assured_app` DML vs. `assured_migrator` DDL).
- **Transactional Email**: Nodemailer with authenticated Hostinger SMTP (`smtp.hostinger.com:465`). Durable database-backed outbox pattern with exponential backoff retry; submissions are stored safely even if SMTP is degraded.
- **Reverse Proxy**: Caddy 2 with automatic Let's Encrypt TLS certificates, HTTP-to-HTTPS redirection, HSTS, security headers, 1MB payload limits, and internal route blocking (`/api/internal*`).
- **Automation & CI/CD**: Docker multi-stage non-root container (`node:22-alpine`), GitHub Container Registry (GHCR), and GitHub Actions CI/CD deploying to Linux VPS over SSH with automated health check verification and rollback.

---

## 3. Quick Start (Local Development)

### Prerequisites
- Node.js 22.x or 24.x
- Docker & Docker Compose (optional, for local database container)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Setup
Create a local `.env` file or use `.env.example`:
```bash
cp .env.example .env
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 4. Verification and Testing Commands

Run all checks locally before pushing changes:

```bash
# Check TypeScript types
npm run typecheck

# Run automated test suite (32 unit & integration tests)
npm run test

# Run Next.js production build
npm run build

# Verify worker compilation
npx esbuild worker/index.ts --bundle --platform=node --format=cjs --outfile=dist/worker.cjs --target=node22
```

---

## 5. Local Docker Container Run

To spin up the entire container stack locally (PostgreSQL, App, Worker, and Caddy with local HTTP overlay):

```bash
docker compose -f compose.yaml -f compose.local.yaml up --build
```

Access the local Caddy entrypoint at [http://localhost:8080](http://localhost:8080).

---

## 6. Repository Layout

```text
├── .github/workflows/
│   └── ci-cd.yml             # Lint, test, build, GHCR push, VPS deploy, health rollback
├── app/
│   ├── admin/                # Authenticated application desk (/admin/applications, /admin/login)
│   ├── api/
│   │   ├── admin/            # Protected admin API routes (login, logout, list, patch status)
│   │   ├── applications/     # Public affiliate submission API route (rate limited, honeypot)
│   │   ├── health/           # Liveness (/api/health/live) and readiness (/api/health/ready)
│   │   └── internal/         # Outbox processing route (blocked externally by Caddy)
│   ├── apply/                # Affiliate application questionnaire page & success receipt
│   ├── campaigns/            # Campaign categories showcase
│   ├── legal/                # Terms, Privacy Policy, and Regulatory Disclaimer
│   ├── globals.css           # Custom theme colors and motion rules
│   ├── layout.tsx            # Root layout with fonts, header, footer, and toaster
│   └── page.tsx              # Homepage with classical luxury hero and vertical cards
├── components/
│   ├── admin/                # Admin table, logout button, status updater
│   ├── apply/                # Complete affiliate application multi-section form
│   ├── home/                 # GSAP animated hero section
│   ├── layout/               # Header, navigation, and footer
│   └── ui/                   # Reusable button, input, card, and select primitives
├── docker/
│   └── postgres/             # Database role initialization script (init-app-user.sh)
├── docs/
│   ├── DEPLOYMENT.md         # Production VPS setup, DNS, SSH, and GitHub Secrets guide
│   ├── SECURITY.md           # VPS hardening, DB isolation, and credential rotation runbook
│   ├── DATABASE_BACKUP_RESTORE.md # Daily backups, integrity checks, S3 sync, and restore steps
│   └── ROLLBACK.md           # Automated and manual rollback runbook
├── drizzle/                  # SQL migration files (0000_init.sql)
├── lib/
│   ├── applications/         # Application submission and transaction persistence
│   ├── auth/                 # Admin session JWT creation, cookie handling, password comparison
│   ├── db/                   # Drizzle client, connection pool, and table schemas
│   ├── email/                # Outbox processor, Hostinger SMTP transport, email templates
│   ├── validation/           # Zod schemas for application validation and timing protection
│   ├── constants.ts          # Company metadata, campaigns, revenue ranges, terms version
│   ├── hash.ts               # Constant-time comparison and salted SHA-256 helpers
│   ├── http.ts               # Same-origin verification and JSON response helpers
│   ├── logger.ts             # Structured JSON logger with credential redaction
│   └── rate-limit.ts         # IP extraction and database rate-limit checks
├── scripts/
│   ├── backup.sh             # pg_dump, gzip -9, sha256sum, S3 upload, and 14-day prune
│   ├── backup-loop.sh        # Background backup container daemon
│   ├── deploy.sh             # Production VPS deployment script with healthcheck verification
│   ├── entrypoint-migrate.sh # Standalone migration entrypoint
│   ├── healthcheck.sh        # CLI healthcheck script
│   ├── restore.sh            # Gzip check, SHA-256 verification, and psql database restore
│   └── rollback.sh           # Automatic image rollback script
├── worker/
│   └── index.ts              # Background email outbox worker daemon
├── Caddyfile                 # Caddy reverse proxy configuration with automatic TLS & HSTS
├── compose.yaml              # Production Docker Compose orchestration
├── compose.local.yaml        # Local development Compose overlay
├── Dockerfile                # Multi-stage non-root production Dockerfile
├── proxy.ts                  # Server-level request routing & protection (Next.js 16)
└── vitest.config.ts          # Test runner configuration
```

---

## 7. Production Deployment & Documentation

For complete production operational guides, consult the dedicated documentation:

1. **[Deployment Guide](docs/DEPLOYMENT.md)**: VPS provisioning, DNS A records, SSH deployment keys, GitHub Secrets configuration, and initial bootstrap.
2. **[Security Guide](docs/SECURITY.md)**: VPS firewall (UFW), SSH hardening, PostgreSQL network isolation, least-privilege DB users, and credential rotation.
3. **[Backup and Restore Runbook](docs/DATABASE_BACKUP_RESTORE.md)**: Automated backups, SHA-256 checksums, offsite Amazon S3 replication, and tested restoration procedures.
4. **[Rollback Runbook](docs/ROLLBACK.md)**: Health-check triggered automatic rollbacks, manual image rollbacks, and expand-and-contract schema migrations.
