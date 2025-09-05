# C:\deployments\bbserver\backup_sqlite.ps1
param(
  [string]$DbPath = "C:\deployments\bbserver\db.sqlite3",
  [string]$BackupDir = "C:\backups\bookingbite",
  [int]$DaysToKeep = 1825,              # keep ~5 years (adjust as you like)
  [string]$Sqlite3 = "sqlite3",         # set full path if not on PATH
  [string]$VenvPython = "C:\deployments\bbserver\venv\Scripts\python.exe"  # fallback
)

if (!(Test-Path $DbPath)) { throw "DB not found: $DbPath" }
if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Force $BackupDir | Out-Null }

$stamp  = Get-Date -Format "yyyyMMdd_HHmmss"
$target = Join-Path $BackupDir "db_$stamp.sqlite3"

function Use-PythonBackup($src, $dst, $py) {
  if (!(Test-Path $py)) { throw "sqlite3.exe failed and Python fallback not found at: $py" }

  $tempPy = Join-Path $env:TEMP ("sqlite_backup_{0}.py" -f ([guid]::NewGuid().ToString("N")))
  $code = @"
import sqlite3, os, sys
src = r'''$src'''
dst = r'''$dst'''
os.makedirs(os.path.dirname(dst), exist_ok=True)
with sqlite3.connect(src) as src_con:
    with sqlite3.connect(dst) as dst_con:
        src_con.backup(dst_con)
print(dst)
"@
  Set-Content -Path $tempPy -Value $code -Encoding UTF8
  try {
    & $py $tempPy
    if ($LASTEXITCODE -ne 0 -or !(Test-Path $dst)) {
      throw "Python backup failed (exit $LASTEXITCODE)."
    }
  } finally {
    Remove-Item -Force $tempPy -ErrorAction SilentlyContinue
  }
}

# Try sqlite3.exe first (if available), else fallback to Python
$usePython = $false
try {
  $null = Get-Command $Sqlite3 -ErrorAction Stop
} catch {
  $usePython = $true
}

if (-not $usePython) {
  & $Sqlite3 $DbPath ".backup '$target'"
  if ($LASTEXITCODE -ne 0 -or !(Test-Path $target)) {
    Write-Warning "sqlite3.exe backup failed (exit $LASTEXITCODE). Falling back to Python."
    $usePython = $true
  }
}

if ($usePython) {
  Use-PythonBackup -src $DbPath -dst $target -py $VenvPython
}

# Rotate old backups (simple days-based retention)
Get-ChildItem -Path $BackupDir -Filter "db_*.sqlite3" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$DaysToKeep) } |
  Remove-Item -Force

Write-Host "Backup written: $target"
