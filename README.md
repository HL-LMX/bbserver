# BookingBite – Windows/IIS Deployment & Runtime Guide

This document summarizes how the BookingBite site is deployed, how the pieces fit together, and which settings are required on Windows/IIS (including Waitress, a Windows service, URL Rewrite, and ARR). It reflects the **general project setup** and **what’s required** to run it reliably.

---

## 1) High‑Level Architecture

- **Frontend**: React single‑page app (CRA build).  
  Deployed as static files under IIS site **“BookingBiteFrontend”** at  
  `C:\inetpub\wwwroot\bookingbite`.

- **Backend**: Django app served by **Waitress** on **127.0.0.1:8000**.  
  The Python process runs as a Windows Service (service name seen in prod: **bookingbite_api**).

- **Reverse proxy / Web server**: **IIS 10** with **URL Rewrite** + **Application Request Routing (ARR)**.  
  IIS serves the SPA and proxies API requests to Waitress.

- **CORS**: Returned by the backend; responses include `Access-Control-Allow-Origin` for the site origin.

**Request flow**  
Browser → IIS (port 80) → (static files or `/api/*` proxy) → Waitress (127.0.0.1:8000) → Django → IIS → Browser.

---

## 2) Key Locations & Identities

- **IIS site name**: `BookingBiteFrontend`  
- **Site root**: `C:\inetpub\wwwroot\bookingbite`
- **Backend working dir**: `C:\deployments\bbserver`
- **Waitress URL**: `http://127.0.0.1:8000` (loopback only)
- **IIS bindings**: `http://194.9.161.245:80` and `http://127.0.0.1:80`
- **Windows service** (typical): `bookingbite_api`

---

## 3) IIS Configuration

IIS uses **URL Rewrite** rules (site scope) and **ARR** to proxy API traffic to Waitress. **Rule order matters** (API rules must come before the SPA catch‑all).

### 3.1 Inbound Rules (site scope)

1. **Add Trailing Slash to API**  
   - Pattern: `^api/(.+[^/])$`  
   - Action: **Redirect** → `/api/{R:1}/`  
   - Purpose: normalize API URLs so DRF/Django trailing slash expectations are met.

2. **Proxy API to Django**  
   - Pattern: `^api/(.*)`  
   - Action: **Rewrite** → `http://127.0.0.1:8000/{R:1}`  
   - Purpose: route all API calls to the local Waitress server.

3. **SPA Routing** (catch‑all)  
   - Pattern: `.*`  
   - Conditions: `{REQUEST_FILENAME} IsFile = false`, `{REQUEST_FILENAME} IsDirectory = false`  
   - Action: **Rewrite** → `/index.html`  
   - Purpose: serve the React app for all non‑API, non‑static requests.

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

> **ARR note**: ARR must be installed and enabled so that the **Rewrite** → **http://127.0.0.1:8000/...** proxying works.

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

The Django backend is served by **Waitress** bound to **127.0.0.1:8000** (not publicly exposed). It’s recommended to run it as a Windows service for resilience (NSSM is a common way to install a Python process as a service).

### 4.1 Typical Waitress Invocation

From the backend working dir (virtual env recommended):
```powershell
# Example invocation
python -m waitress --listen=127.0.0.1:8000 myproject.wsgi:application
# or
waitress-serve --listen=127.0.0.1:8000 myproject.wsgi:application
```

### 4.2 Example NSSM Service Setup (canonical)

> If NSSM is installed and on PATH; adjust paths/names as appropriate.

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

The React app reads the API base URL at **build time** from `process.env.REACT_APP_API_URL`. In production, provide:

**`<react-project-root>/.env.production.local`**
```dotenv
REACT_APP_API_URL=/api/
```

Then build and deploy:
```bash
npm ci
npm run build
# Copy build output to IIS site root:
#   build/*  ->  C:\inetpub\wwwroot\bookingbite
```

> Using `/api/` makes the app origin‑agnostic; IIS will proxy `/api/*` to Waitress.

### 5.1 API Helpers Used by the SPA
```js
// base
export const API_URL = process.env.REACT_APP_API_URL;

// endpoints
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

## 6) Smoke Tests

```powershell
# Should return JSON (proxied via IIS → Waitress → Django)
curl.exe -i "http://<PUBLIC-IP>/api/booking/week/?date=2025-05-28"

# Should return SPA HTML (served by IIS static + SPA routing)
curl.exe -i "http://<PUBLIC-IP>/booking/week/?date=2025-05-28"
```

---

## 7) Security & Ops Notes

- Keep Waitress bound to **127.0.0.1** (loopback) so it’s reachable only via IIS.
- Ensure CORS in the backend allows the site origin (e.g., `http://<PUBLIC-IP>` or your hostname).
- If you change DRF’s trailing‑slash behavior, adjust the “Add Trailing Slash to API” rule accordingly.
- Consider enabling service logging (NSSM stdout/stderr) and Django/Waitress logs under `C:\deployments\bbserver\logs`.
- Place the API rules **above** the SPA catch‑all to prevent the SPA from intercepting API requests.

---

## 8) Common Pitfalls

- **Missing `REACT_APP_API_URL` at build time** → frontend calls `/booking/...` and receives SPA HTML instead of JSON.  
  **Fix**: set `.env.production.local` with `REACT_APP_API_URL=/api/` **before** building.

- **Wrong rewrite rule order** → SPA catch‑all swallows API routes.  
  **Fix**: ensure API rules are **above** the SPA rule.

- **Exposing Waitress publicly** by binding `0.0.0.0`.  
  **Fix**: keep `127.0.0.1` and proxy via IIS.

---

## 9) Quick Reference (Commands)

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
