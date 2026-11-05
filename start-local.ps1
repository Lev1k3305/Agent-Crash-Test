# ==============================================================================
# Agent Crash Test — Windows Local Startup Script (PowerShell)
# Architecture: Local-First (FastAPI + React 19 Vite + SQLite)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Agent Crash Test - Starting Local-First Application" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Python installation (python or py)
$pythonExe = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonExe = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonExe = "py"
}

if (-not $pythonExe) {
    Write-Error "Python 3.10+ was not found in PATH. Please install Python from python.org to run backend."
    exit 1
}

# Check Python dependencies
Write-Host "[1/5] Checking Python dependencies..." -ForegroundColor Yellow
& $pythonExe -c "import fastapi, uvicorn, sqlalchemy, alembic" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing missing Python dependencies..." -ForegroundColor Yellow
    & $pythonExe -m pip install fastapi uvicorn pydantic-settings sqlalchemy alembic httpx python-dotenv
}

# 2. Check Node / Bun installation
$frontendManager = $null
if (Get-Command bun -ErrorAction SilentlyContinue) {
    $frontendManager = "bun"
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $frontendManager = "npm"
}

if (-not $frontendManager) {
    Write-Error "Neither Node.js (npm) nor Bun was found in PATH. Please install Node.js (v18+) or Bun."
    exit 1
}

# 3. Create persistent data directory if not exists (never deletes existing database)
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Force -Path "data" | Out-Null
    Write-Host "[2/5] Created local persistent data directory: .\data" -ForegroundColor Green
} else {
    Write-Host "[2/5] Persistent local data directory ready: .\data" -ForegroundColor Green
}

# 4. Check frontend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[3/5] Installing frontend dependencies ($frontendManager)..." -ForegroundColor Yellow
    if ($frontendManager -eq "bun") {
        & bun install
    } else {
        & npm install
    }
} else {
    Write-Host "[3/5] Frontend dependencies already installed." -ForegroundColor Green
}

# 5. Run Alembic migrations to latest head safely
Write-Host "[4/5] Applying SQLite schema migrations (Alembic)..." -ForegroundColor Yellow
$env:PYTHONPATH = "."
& $pythonExe -m alembic upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Alembic upgrade encountered a warning or database is already up to date. Continuing..."
}

# 6. Launch FastAPI Backend and Vite Frontend in separate persistent processes
Write-Host "[5/5] Launching backend and frontend in separate console windows..." -ForegroundColor Green

# Backend Terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FastAPI Authoritative Backend running on http://127.0.0.1:8000'; `$env:PYTHONPATH='.'; $pythonExe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

# Frontend Terminal
if ($frontendManager -eq "bun") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'React 19 + Vite Frontend running...'; bun run dev"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'React 19 + Vite Frontend running...'; npm run dev"
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Application processes launched successfully!" -ForegroundColor Cyan
Write-Host " Both processes will remain running in their respective windows." -ForegroundColor Gray
Write-Host "   Frontend Web UI:   http://localhost:3000 (or http://localhost:5173)" -ForegroundColor White
Write-Host "   Backend API URL:   http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   Swagger API Docs:  http://127.0.0.1:8000/api/docs" -ForegroundColor White
Write-Host "   SQLite Database:   data\agent_crash_test.db" -ForegroundColor White
Write-Host ""
Write-Host " To stop: Close the respective PowerShell windows or press Ctrl+C inside them." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
