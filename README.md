# BookingBite — Windows/IIS Deployment & Runtime Guide

This document summarizes how the BookingBite site is deployed, how the
pieces fit together, and which settings are required on Windows/IIS
(including Waitress, a Windows service, URL Rewrite, and ARR). It
reflects the **current project setup** and **what’s required** to run it
reliably.

---

## 1) High-Level Architecture

- **Frontend**: React single-page app (CRA build).  
  Deployed as static files under the IIS site **“BookingBiteFrontend”** at  
  `C:\inetpub\wwwroot\bookingbite`.

- **Backend**: Django app served by **Waitress** on **127.0.0.1:8000**.  
  The Python process runs as a Windows Service (service name typically **bookingbite_api**).

- **Reverse proxy / Web server**: **IIS 10** with **URL Rewrite** +
  **Application Request Routing (ARR)**.  
  IIS serves the SPA and proxies API requests to Waitress.

- **CORS**: Set by the backend; responses allow the site origin.

**Request flow**  
Browser → IIS (80) → (static files or `/api/*` proxy) → Waitress
(127.0.0.1:8000) → Django → IIS → Browser.

---

## 2) Key Locations & Identities

- **IIS site name**: `BookingBiteFrontend`  
- **Site root**: `C:\inetpub\wwwroot\bookingbite`  
- **Frontend working copy (build location)**: `C:\deployments\bbclient` ✅  
- **Backend working dir**: `C:\deployments\bbserver`  
- **Waitress URL**: `http://127.0.0.1:8000` (loopback only)  
- **IIS bindings**: your public host/IP on port 80 (e.g., `http://194.9.161.245:80`) and loopback `http://127.0.0.1:80`  
- **Windows service**: `bookingbite_api` (typical)  
- **Backup directory**: `C:\backups\bookingbite` (automated hot backups, rotated)

> **Why `C:\deployments\bbclient` matters**: the production build reads env from `.env.production.local` in this folder. Building elsewhere (e.g., the GitHub runner workspace) can produce a bundle with the wrong API base URL.

---

## 3) IIS Configuration

IIS uses **URL Rewrite** rules (site scope) and **ARR** to proxy API
traffic to Waitress. **Rule order matters** (API rules must be above the SPA catch-all).

### 3.1 Inbound Rules (site scope)

1) **Add Trailing Slash to API**  
- Pattern: `^api/(.+[^/])$`  
- Action: **Redirect** → `/api/{R:1}/`  
- Purpose: normalize API URLs for DRF’s trailing-slash behavior.

2) **Proxy API to Django**  
- Pattern: `^api/(.*)`  
- Action: **Rewrite** → `http://127.0.0.1:8000/{R:1}`  
- Purpose: route `/api/*` to Waitress.

3) **SPA Routing** (catch-all)  
- Pattern: `.*`  
- Conditions: `{REQUEST_FILENAME} IsFile = false`, `{REQUEST_FILENAME} IsDirectory = false`  
- Action: **Rewrite** → `/index.html`  
- Purpose: serve the React app for all non-API, non-static requests.

#### Example `web.config` `<rewrite>` excerpt

```xml
<system.webServer>
  <rewrite>
    <rules>
      <rule name="Add Trailing Slash to API" stopProcessing="true">
        <match url="^api/(.+[^/])$" />
        <conditions logicalGrouping="MatchAll">
          <add input="{REQUEST_URI}" pattern="^/api/.+[^/]$" />
        </conditions>
        <action type="Redirect" url="/api/{R:1}/" />
      </rule>

      <rule name="Proxy API to Django" stopProcessing="true">
        <match url="^api/(.*)" />
        <action type="Rewrite" url="http://127.0.0.1:8000/{R:1}" />
      </rule>

      <rule name="SPA Routing">
        <match url=".*" />
        <conditions logicalGrouping="MatchAll">
          <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
        </conditions>
        <action type="Rewrite" url="/index.html" />
      </rule>
    </rules>
  </rewrite>
</system.webServer>
```

> **ARR note**: ARR must be installed and enabled so the
> **Rewrite** → **http://127.0.0.1:8000/...** proxying works.

### 3.2 Useful IIS Commands (PowerShell/AppCmd)

```powershell
# Site overview
Get-Website -Name BookingBiteFrontend | Select Name, State, PhysicalPath, ApplicationPool
Get-WebBinding -Name BookingBiteFrontend

# Show rewrite rules (order and details)
& $env:SystemRoot\System32\inetsrv\appcmd.exe list config BookingBiteFrontend /section:system.webServer/rewrite/rules
```

---

## 4) Backend: Waitress + Windows Service

The Django backend is served by **Waitress** bound to **127.0.0.1:8000**
(not publicly exposed). It runs as a Windows service for resilience (NSSM is a common way to install a Python process as a service).

### 4.1 Typical Waitress Invocation

From the backend working dir (virtual env recommended):

```powershell
python -m waitress --listen=127.0.0.1:8000 myproject.wsgi:application
# or
waitress-serve --listen=127.0.0.1:8000 myproject.wsgi:application
```

### 4.2 Example NSSM Service Setup

```powershell
# Install service
nssm install bookingbite_api "C:\path\to\venv\Scripts\python.exe" ^
  "-m waitress --listen=127.0.0.1:8000 myproject.wsgi:application"

# Set startup directory
nssm set bookingbite_api AppDirectory "C:\deployments\bbserver"

# Optional I/O redirection to logs
nssm set bookingbite_api AppStdout "C:\deployments\bbserver\logs\waitress.out.log"
nssm set bookingbite_api AppStderr "C:\deployments\bbserver\logs\waitress.err.log"

# Start automatically
nssm set bookingbite_api Start SERVICE_AUTO_START

# Start the service
nssm start bookingbite_api
```

### 4.3 Quick Backend Health Checks

```powershell
# Process listening on 8000
netstat -ano | findstr :8000

# Identify the python.exe by PID
tasklist /FI "PID eq <PID>"

# Confirm service status
Get-Service | ? { $_.Name -match 'booking|waitress|django|python' -or $_.DisplayName -match 'booking|waitress|django|python' } |
  ft -Auto Name,DisplayName,Status
```

---

## 5) Frontend Build & Environment

The React app reads the API base URL at **build time** from
`process.env.REACT_APP_API_URL`. In production, provide:

**`C:\deployments\bbclient\.env.production.local`**

```dotenv
REACT_APP_API_URL=/api/
```

Then build and deploy (server-side, in `C:\deployments\bbclient`):

```powershell
npm ci
npm run build
# Copy build output to IIS site root:
#   C:\deployments\bbclient\build\*  ->  C:\inetpub\wwwroot\bookingbite
```

> Using `/api/` keeps the app origin-agnostic; IIS proxies `/api/*`
> to Waitress.

### 5.1 SPA API helpers (shape)

```js
export const API_URL = process.env.REACT_APP_API_URL;

export const API_ENDPOINTS = {
  DISHES_AVAILABLE_WEEK: (date) => `booking/week?date=${date}`,
  ADD_ATTENDANCE: 'booking/add-attendance/',
  REMOVE_ATTENDANCE: 'booking/remove-attendance/',
  RATE: 'booking/rate/',
  CHEF_DAY_DISHES: (date) => `chef-management/day-dishes/${date}/`,
  CHEF_CREATE_DISH: 'chef-management/create/',
  CHEF_DELETE_DISH: 'chef-management/delete-dish-from-date/',
  SEARCH_DISHES: 'chef-management/search-dishes/?',
};
```

With `REACT_APP_API_URL=/api/`, runtime requests look like:

```
/api/booking/week/?date=YYYY-MM-DD
```

---

## 6) CI/CD — GitHub Actions (Self-Hosted Runner on the Server)

**What actually works now**

- The Workflow runs on your self-hosted Windows runner (labels like: `[self-hosted, windows, iis, bookingbite, frontend]`).
- **Shell is Windows PowerShell** (`shell: powershell`) — not `pwsh`.
- The job **builds in `C:\deployments\bbclient`** (same as your manual script), so the correct `.env.production.local` is used.
- **CRA warnings are not treated as errors**: the job unsets `CI` and sets `DISABLE_ESLINT_PLUGIN=true` before `npm run build`.
- After build, it copies `C:\deployments\bbclient\build\*` to `C:\inetpub\wwwroot\bookingbite`, preserving `web.config`.

**Minimal outline of the job steps**

```powershell
# 1) Update repo
Set-Location C:\deployments\bbclient
git fetch origin
git reset --hard origin/main

# 2) Install + ensure CRA/babel quirk is handled
npm ci
if (-not (Test-Path "node_modules\@babel\plugin-proposal-private-property-in-object")) {
  npm install -D @babel/plugin-proposal-private-property-in-object
}

# 3) Build without CI hard-fail on warnings
if (Test-Path Env:CI) { Remove-Item Env:CI -ErrorAction SilentlyContinue }
$env:DISABLE_ESLINT_PLUGIN = "true"
npm run build

# 4) Deploy to IIS (keep web.config)
$deploy = 'C:\inetpub\wwwroot\bookingbite'
Get-ChildItem $deploy | ? { $_.Name -ne 'web.config' } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "C:\deployments\bbclient\build\*" -Destination $deploy -Recurse -Force
```

> If your environment requires proxies/CA bundles, set those as env vars for the job (HTTPS_PROXY, NODE_EXTRA_CA_CERTS, etc.).

---

## 7) Smoke Tests

```powershell
# Should return JSON (proxied via IIS → Waitress → Django)
curl.exe -i "http://<PUBLIC-HOST>/api/booking/week/?date=2025-05-28"

# Should return SPA HTML (served by IIS static + SPA routing)
curl.exe -i "http://<PUBLIC-HOST>/booking/week/?date=2025-05-28"
```

---

## 8) Security & Ops Notes

- Keep Waitress on **127.0.0.1** so it’s reachable only via IIS.
- Ensure backend CORS allows the site origin (IP/hostname in production).
- If you change DRF’s trailing-slash behavior, adjust the “Add Trailing Slash to API” rule.
- Enable service logging (NSSM stdout/stderr) and Django/Waitress logs under `C:\deployments\bbserver\logs`.
- Place API rules **above** the SPA catch-all in URL Rewrite.

---

## 9) Common Pitfalls (Updated)

- **Built with the wrong env** → Frontend shows UI but **no data**.  
  **Cause**: building in the GitHub workspace (or with different env) so `REACT_APP_API_URL` isn’t `/api/`.  
  **Fix**: build in `C:\deployments\bbclient` where `.env.production.local` lives, then deploy from there.

- **CRA treats warnings as errors in CI** → build exits 1.  
  **Fix**: unset `CI` and set `DISABLE_ESLINT_PLUGIN=true` for the build step.

- **Wrong shell on runner** (`pwsh: command not found`).  
  **Fix**: use `shell: powershell` on Windows Server 2019 unless PowerShell 7 is installed.

- **SPA catch-all above API rules** → API calls return HTML.  
  **Fix**: ensure API rules are **above** the SPA rule.

- **Exposing Waitress publicly** by binding `0.0.0.0`.  
  **Fix**: keep `127.0.0.1` and proxy via IIS.

---

## 10) Quick Reference (Commands)

```powershell
# IIS site & binding
Get-Website -Name BookingBiteFrontend | Select Name, State, PhysicalPath, ApplicationPool
Get-WebBinding -Name BookingBiteFrontend

# Rewrite rules
& $env:SystemRoot\System32\inetsrv\appcmd.exe list config BookingBiteFrontend /section:system.webServer/rewrite/rules

# Backend port & process
netstat -ano | findstr :8000
tasklist /FI "PID eq <PID>"

# Service inventory
Get-Service | ? { $_.Name -match 'booking|waitress|django|python' -or $_.DisplayName -match 'booking|waitress|django|python' } |
  ft -Auto Name,DisplayName,Status
```

---

## 11) Database Backup Strategy (SQLite)

SQLite is file-based. We use **hot backups** and Windows **Task Scheduler** to automate them.

- **Backup script**: `C:\deployments\bbserver\backup_sqlite.ps1`  
  - Uses SQLite’s native `.backup` if available, otherwise Python’s `sqlite3.backup()` (transactionally consistent).
  - Writes timestamped copies to `C:\backups\bookingbite`.
  - Rotates old backups (default: **1825 days** ≈ 5 years; configurable via `-DaysToKeep`).
- **Schedule**: **Tuesdays & Saturdays at 02:00**, runs as **SYSTEM** (no password, runs whether a user is logged on or not).  
- **Offsite (recommended)**: mirror `C:\backups\bookingbite` to cloud or a network target with a separate job/account as needed.

### 11.1 One-time setup (create/replace the Scheduled Task)

Run in **elevated PowerShell**:

```powershell
# Ensure backup directory exists
New-Item -ItemType Directory -Force C:\backups\bookingbite | Out-Null

# Create/replace the scheduled task (Tue & Sat @ 02:00, runs as SYSTEM, highest privileges)
$ps = "$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"
$taskName = "Bookingbite SQLite Backup (Tue+Sat 02:00)"
schtasks /Create /TN "$taskName" /SC WEEKLY /D TUE,SAT /ST 02:00 `
  /TR "`"$ps`" -NoProfile -ExecutionPolicy Bypass -File `"`"C:\deployments\bbserver\backup_sqlite.ps1`"`"" `
  /RL HIGHEST /RU "SYSTEM" /F
```

> Change retention by passing `-DaysToKeep <N>`:
> ```powershell
> schtasks /Change /TN "Bookingbite SQLite Backup (Tue+Sat 02:00)" /TR "`"$ps`" -NoProfile -ExecutionPolicy Bypass -File `"`"C:\deployments\bbserver\backup_sqlite.ps1`"`" -DaysToKeep 3650"
> ```

### 11.2 Operate / validate

```powershell
# Run now (on-demand test)
schtasks /Run /TN "Bookingbite SQLite Backup (Tue+Sat 02:00)"

# Check latest status
schtasks /Query /TN "Bookingbite SQLite Backup (Tue+Sat 02:00)" /V /FO LIST

# Confirm files are created
Get-ChildItem C:\backups\bookingbite | Sort LastWriteTime -Descending | Select -First 5
```

### 11.3 Notes

- **Why SYSTEM?** Passwordless, always present, ideal for local file→local backup.  
  If you later push to a **network share**, run a separate sync task under a domain service account with proper rights.
- Keep `C:\deployments\bbserver\db.sqlite3` **out of version control**; rely on automated backups + offsite mirroring.
- Storage impact with **Tue+Sat** backups and your growth rate is negligible (~**323 MB over 5 years**).
