# 🌊 Deployment Guide — DigitalOcean App Platform

🇬🇧 **English** | [🇪🇸 Versión en Español](./Despliegue_DigitalOcean.md)

This guide explains step by step how to deploy **Polyglot Path** on [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform), using the existing Dockerfile and a managed PostgreSQL database.

---

## 📋 Table of Contents

1. [Prerequisites](#-1-prerequisites)
2. [Deployment Architecture](#-2-deployment-architecture)
3. [Option A — Deploy from the Web Panel (GUI)](#-3-option-a--deploy-from-the-web-panel-gui)
4. [Option B — Deploy with doctl (CLI)](#-4-option-b--deploy-with-doctl-cli)
5. [Configure Environment Variables](#-5-configure-environment-variables)
6. [Verify the Deployment](#-6-verify-the-deployment)
7. [Custom Subdomain (polyglot.jassdev.tech)](#-7-custom-subdomain)
8. [Estimated Costs](#-8-estimated-costs)
9. [Troubleshooting](#-9-troubleshooting)

---

## 🔧 1. Prerequisites

| Requirement | Description |
|:---|:---|
| **DigitalOcean Account** | Create one at [cloud.digitalocean.com](https://cloud.digitalocean.com/registrations/new) |
| **GitHub Repository** | Your code must be at `github.com/juanan09/polyglot-path` with the `main` branch up to date |
| **Groq API Key** | Required if using `LLM_PROVIDER=groq` (or Google AI, depending on your config) |

> [!TIP]
> DigitalOcean offers **$200 in free credits for 60 days** for new accounts. Perfect for academic projects.

---

## 🏗️ 2. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                DigitalOcean App Platform             │
│                                                     │
│  ┌───────────────────┐    ┌──────────────────────┐  │
│  │  polyglot-app      │    │  polyglot-db          │  │
│  │  (Nuxt 4 + Nitro) │◄──►│  (PostgreSQL 16)      │  │
│  │  Dockerfile        │    │  Managed Database     │  │
│  │  Port 3000         │    │  db-s-dev-database    │  │
│  └───────────────────┘    └──────────────────────┘  │
│         ▲                                           │
│  ┌──────┴────────────┐                              │
│  │ polyglot-migrator  │  ← PRE_DEPLOY Job           │
│  │ Dockerfile.migrate │  (Drizzle migrations)       │
│  └───────────────────┘                              │
└─────────────────────────────────────────────────────┘
          ▲
          │ HTTPS (automatic)
          │
     🌐 Internet
```

**Components:**

- **`polyglot-app`**: Nuxt 4 application built from the multi-stage `Dockerfile`. Exposed via HTTPS automatically.
- **`polyglot-migrator`**: `PRE_DEPLOY` job that runs `pnpm run db:migrate` before each deployment. Uses `Dockerfile.migrate`.
- **`polyglot-db`**: PostgreSQL 16 database managed by DigitalOcean (automatic backups, high availability).

---

## 🖥️ 3. Option A — Deploy from the Web Panel (GUI)

### Step 1: Connect GitHub

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Select **GitHub** as the source
4. Authorize DigitalOcean to access your GitHub account
5. Select the repository **`juanan09/polyglot-path`** and the **`main`** branch

### Step 2: Configure the Web Service

1. DigitalOcean will automatically detect your `Dockerfile`
2. Verify that:
   - **Source**: `juanan09/polyglot-path` → branch `main`
   - **Type**: Web Service
   - **Dockerfile**: `Dockerfile` (auto-detected)
   - **HTTP Port**: `3000`
3. In the **Plan** section, select:
   - **Professional** → `professional-xs` ($12/month) — Recommended
   - Or **Basic** → `basic-xxs` ($5/month) — For quick testing

### Step 3: Add the Database

1. Click **"Add Resource" → "Database"**
2. Select:
   - **Engine**: PostgreSQL
   - **Version**: 16
   - **Plan**: `Dev Database` ($0/month — free) or `Basic` ($15/month)
3. Name the database: `polyglot-db`

### Step 4: Add the Migration Job

1. Click **"Add Resource" → "Job"**
2. Configure:
   - **Source**: Same repo (`juanan09/polyglot-path`, branch `main`)
   - **Dockerfile**: `Dockerfile.migrate`
   - **Kind**: `Pre Deploy`
   - **Name**: `polyglot-migrator`
3. In the job's env vars, add:
   - `DATABASE_URL` = `${polyglot-db.DATABASE_URL}`

### Step 5: Configure Environment Variables

In the **Environment Variables** section of the `polyglot-app` service, add:

| Variable | Value | Encrypt |
|:---|:---|:---|
| `DATABASE_URL` | `${polyglot-db.DATABASE_URL}` | No |
| `SESSION_PASSWORD` | *(generate a +32 char password)* | ✅ Yes |
| `LLM_PROVIDER` | `groq` | No |
| `GROQ_API_KEY` | *(your Groq API key)* | ✅ Yes |
| `NODE_ENV` | `production` | No |

> [!IMPORTANT]
> The `${polyglot-db.DATABASE_URL}` syntax is specific to App Platform. It automatically injects the real connection URL for your managed database. **DO NOT type it manually.**

### Step 6: Deploy

1. Review the summary of all components
2. Select the nearest **region** (e.g., `fra` for Frankfurt, Europe)
3. Click **"Create Resources"**
4. Wait ~5-10 minutes while the image builds and migrations run

---

## ⌨️ 4. Option B — Deploy with doctl (CLI)

### Step 1: Install doctl

```powershell
# Windows (with Chocolatey)
choco install doctl

# Windows (with Scoop)
scoop install doctl
```

```bash
# macOS
brew install doctl

# Linux
snap install doctl
```

### Step 2: Authenticate

```bash
doctl auth init
# It will ask for an API Token. Create one at:
# https://cloud.digitalocean.com/account/api/tokens
```

### Step 3: Edit the App Spec

The `.do/app.yaml` file is already created in your project. **Replace the values marked as `REPLACE_...`** before deploying:

- `REPLACE_WITH_A_STRONG_SECRET_MIN_32_CHARS` → a random password of +32 characters
- `REPLACE_WITH_YOUR_GROQ_API_KEY` → your Groq API key

> [!WARNING]
> **NEVER commit `app.yaml` with real secrets.** Safe options:
> 1. Edit the values locally before running `doctl` and **do not commit** those changes
> 2. Configure the secrets separately in the web panel after creating the app
> 3. Add `.do/app.yaml` to `.gitignore` if you plan to store secrets there

### Step 4: Create the App

```bash
doctl apps create --spec .do/app.yaml
```

### Step 5: Check the status

```bash
# List your apps
doctl apps list

# View app details (replace <APP_ID> with the actual ID)
doctl apps get <APP_ID>

# View logs
doctl apps logs <APP_ID> --type=build
doctl apps logs <APP_ID> --type=deploy
doctl apps logs <APP_ID> --type=run
```

### Step 6: Update the App (future changes)

```bash
doctl apps update <APP_ID> --spec .do/app.yaml
```

> [!TIP]
> With `deploy_on_push: true` in the app spec, every `git push` to `main` automatically triggers a new deployment. No manual action needed after the initial setup.

---

## 🔐 5. Configure Environment Variables

### Generate a secure SESSION_PASSWORD

```powershell
# PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

```bash
# Bash (Linux/macOS)
openssl rand -base64 48
```

### Required variables

| Variable | Example | Component |
|:---|:---|:---|
| `DATABASE_URL` | `${polyglot-db.DATABASE_URL}` | App + Migrator |
| `SESSION_PASSWORD` | `aG7xKm9pL2...` (min. 32 chars) | App |
| `NODE_ENV` | `production` | App |
| `LLM_PROVIDER` | `groq` | App |
| `GROQ_API_KEY` | `gsk_...` | App |

### Optional variables (if using Google AI instead of Groq)

| Variable | Example |
|:---|:---|
| `LLM_PROVIDER` | `google` |
| `GOOGLE_GENAI_API_KEY` | `AIza...` |

---

## ✅ 6. Verify the Deployment

1. **Public URL**: App Platform assigns a URL like `https://polyglot-path-xxxxx.ondigitalocean.app`
2. **Check the app**: Navigate to the URL and verify the homepage loads correctly
3. **Check the DB**: Create a test account and verify the session persists
4. **Custom domain** *(optional)*: In the app panel → Settings → Domains, add your own domain with automatic HTTPS

### Verification from CLI

```bash
# View the assigned URL
doctl apps list --format ID,DefaultIngress

# View runtime logs in real time
doctl apps logs <APP_ID> --type=run --follow
```

---

## 🌐 7. Custom Subdomain

Your domain `jassdev.tech` is hosted on Hostinger. You can create a subdomain like `polyglot.jassdev.tech` pointing to the DigitalOcean app **without moving anything or changing nameservers**. You only need a CNAME record.

> [!IMPORTANT]
> **Order of operations**: You must first have the app deployed on DigitalOcean (sections 3-6). The subdomain is configured **after** the first successful deployment.

### Step 1: Get your app's URL on DigitalOcean

After deploying, your app will have an automatic URL like:
```
https://polyglot-path-xxxxx.ondigitalocean.app
```
Write it down — you'll need it for step 3.

### Step 2: Register the subdomain in DigitalOcean

1. Go to **Apps → polyglot-path → Settings → Domains**
2. Click **"Add Domain"**
3. Select **"Use an existing domain you own"**
4. Type: `polyglot.jassdev.tech`
5. DigitalOcean will show the instructions with the **CNAME target** to point to. It will be something like:
   ```
   polyglot-path-xxxxx.ondigitalocean.app.
   ```
6. **Copy that exact value** (including the trailing `.`)

### Step 3: Create the CNAME record in Hostinger

1. Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Select your domain `jassdev.tech`
3. Go to **DNS / DNS Zone** (or "DNS Zone Editor")
4. Click **"Add Record"** and fill in:

| Field | Value |
|:---|:---|
| **Type** | `CNAME` |
| **Name** (Host) | `polyglot` |
| **Points to** (Target) | `polyglot-path-xxxxx.ondigitalocean.app.` |
| **TTL** | `3600` (or default) |

5. Click **Save**

> [!WARNING]
> - The **Name** field is just `polyglot`, NOT `polyglot.jassdev.tech` (Hostinger appends the domain automatically)
> - The **Target** must be exactly the URL provided by DigitalOcean, with the trailing `.`
> - **DO NOT** modify any existing DNS records for `jassdev.tech` — your main website is not affected

### Step 4: Wait for DNS propagation

- Propagation usually takes **5-30 minutes**, though it can take up to 48h in rare cases
- You can check the progress with:

```powershell
# PowerShell (Windows)
nslookup polyglot.jassdev.tech
```

```bash
# Bash (Linux/macOS)
dig polyglot.jassdev.tech CNAME
```

- When it resolves to `polyglot-path-xxxxx.ondigitalocean.app`, you're done!

### Step 5: Verify HTTPS

- DigitalOcean **automatically** generates an SSL certificate (Let's Encrypt) for your subdomain
- No extra steps needed
- Navigate to `https://polyglot.jassdev.tech` and verify that:
  - ✅ The app loads correctly
  - ✅ The lock icon 🔒 appears in the browser bar
  - ✅ The certificate is valid

### Final result

```
jassdev.tech              → Your current website on Hostinger (unchanged)
polyglot.jassdev.tech     → Polyglot Path on DigitalOcean App Platform
```

Both work independently. Your current website is not affected.

---

## 💰 8. Estimated Costs

### Recommended plan

| Component | Plan | Cost/month |
|:---|:---|---:|
| App (professional-xs) | 1 vCPU, 512 MB RAM | $12 |
| Database (dev) | PostgreSQL 16 Dev | $0 (free) |
| **Total** | | **~$12/month** |

### Budget plan

| Component | Plan | Cost/month |
|:---|:---|---:|
| App (basic-xxs) | 1 vCPU, 256 MB RAM | $5 |
| Database (dev) | PostgreSQL 16 Dev | $0 |
| **Total** | | **~$5/month** |

> [!NOTE]
> With the **$200 free credit** for new DigitalOcean accounts, you can keep the app running for **~16 months free** (recommended plan) or **~40 months** (budget plan). More than enough for an academic project.

---

## 🆘 9. Troubleshooting

### ❌ Error: "Build failed"

**Cause**: Usually dependencies that fail to compile on Alpine Linux.  
**Solution**: Check the build logs. If you see native compilation errors, you may need to add packages to the `Dockerfile`:

```dockerfile
# Before the RUN pnpm install line
RUN apk add --no-cache python3 make g++
```

### ❌ Error: "Port not detected" or "Health check failed"

**Cause**: The app is not listening on the expected port.  
**Solution**: Verify that your `Dockerfile` has `ENV PORT=3000` and `EXPOSE 3000`, and that `http_port` in the app spec is `3000`. The current Dockerfile is already configured correctly.

### ❌ Error: "Database connection refused"

**Cause**: The `DATABASE_URL` is not being injected correctly.  
**Solution**:
1. Verify the variable uses the syntax `${polyglot-db.DATABASE_URL}` (exactly like this)
2. The name `polyglot-db` must match the database name in the app spec
3. Make sure the variable has scope `RUN_TIME`

### ❌ Migrations not running

**Cause**: The PRE_DEPLOY job may fail silently.  
**Solution**:
1. Go to Apps → Your App → Jobs → `polyglot-migrator` → Logs
2. Verify `DATABASE_URL` is configured in the job's env vars
3. Check that `Dockerfile.migrate` is in the repository root

### ❌ Error: "Out of memory" (OOM Kill)

**Cause**: The `basic-xxs` plan has only 256 MB RAM, which may be tight for Nuxt SSR.  
**Solution**: Upgrade to `professional-xs` (512 MB) or `professional-s` (1 GB).

### ❌ Genkit asks to "Press Enter" and the app won't start

**Cause**: The `dev` script includes `genkit start` which is interactive, but this **does not affect production** because the `Dockerfile` runs `node .output/server/index.mjs` directly (without the genkit CLI).  
**Solution**: No action needed. The production Dockerfile is already correct.

---

## 📁 Files Created for this Deployment

| File | Description |
|:---|:---|
| [`.do/app.yaml`](../.do/app.yaml) | DigitalOcean App Spec with the full configuration |
| [`Dockerfile.migrate`](../Dockerfile.migrate) | Lightweight Dockerfile exclusively for running Drizzle migrations |
| [`Dockerfile`](../Dockerfile) | *(Already existed)* Multi-stage build for the production app |

---

## 🗺️ Complete Step-by-Step Order (from start to finish)

```
 PREPARATION (your PC)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ① Make sure the 'main' branch on GitHub
   is up to date with your latest code
   → git push origin main

 ② Have your GROQ_API_KEY ready
   (or GOOGLE_GENAI_API_KEY if using Google)

 DIGITALOCEAN (cloud.digitalocean.com)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ③ Create a DigitalOcean account
   (take advantage of the $200 free credit)

 ④ Create App → Connect GitHub repo
   juanan09/polyglot-path → main branch

 ⑤ Add Resource → Database
   PostgreSQL 16, Dev plan (free)

 ⑥ Add Resource → Job (Pre Deploy)
   Dockerfile.migrate → Drizzle migrations

 ⑦ Configure Environment Variables
   DATABASE_URL, SESSION_PASSWORD, GROQ_API_KEY...

 ⑧ Select region (fra = Frankfurt)
   → Create Resources → Wait ~5-10 min

 ⑨ Verify the app works at
   https://polyglot-path-xxxxx.ondigitalocean.app

 HOSTINGER (hpanel.hostinger.com)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⑩ DNS → Add CNAME record
   polyglot → polyglot-path-xxxxx.ondigitalocean.app.

 ⑪ Back to DigitalOcean → Settings → Domains
   → Add polyglot.jassdev.tech

 ⑫ Wait for DNS propagation (~5-30 min)
   → Verify https://polyglot.jassdev.tech 🎉
```

> 💡 **From this point on**, every `git push origin main` will deploy automatically. No further action needed!
