# Agent Crash Test — Deployment & Local Operations Guide

## 1. Local-First Development Architecture

Agent Crash Test operates as a local-first platform requiring no cloud database, Supabase, Vultr, or external infrastructure. Application data is persisted durably to SQLite with Write-Ahead Logging (WAL) and foreign key enforcement.

### Data Storage Specifications
- **Database Engine**: SQLite 3
- **Database File**: `data/agent_crash_test.db`
- **Data Directory**: Automatically created on initialization
- **Concurrency PRAGMAs**: `journal_mode=WAL`, `busy_timeout=5000`, `foreign_keys=ON`
- **Migrations Engine**: Alembic (current head revision: `0002_local_first_persistence`)

---

## 2. Quick Start: Local Full-Stack Development

### Unified Dev Server (Recommended)
The project includes a full-stack entry point (`server.ts`) that runs the Vite frontend development server on port 3000 and automatically spawns and reverse-proxies to the Python FastAPI backend on `127.0.0.1:8001`:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Run database migrations to latest schema
python3 -m alembic upgrade head

# 3. Start development server (serves frontend and proxies /api to FastAPI)
npm run dev
```

Visit `http://localhost:3000` to interact with the Cyber Operations Center.

---

## 3. Native Service Execution (Manual Dual Process)

If you prefer running the Python FastAPI backend and Vite frontend in separate terminal windows:

### Terminal 1: Python FastAPI Service
```bash
# Install Python dependencies
pip install -r <(python3 -c "import tomllib; print('\n'.join(tomllib.load(open('backend/pyproject.toml', 'rb'))['project']['dependencies']))")
# Or: pip install fastapi uvicorn pydantic-settings sqlalchemy alembic httpx

# Run Alembic migrations
python3 -m alembic upgrade head

# Start FastAPI server on port 8001
uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Terminal 2: React Frontend (Vite)
```bash
# Start frontend on port 3000
npm run dev
```

---

## 4. Database Migrations via Alembic

Alembic manages all schema revisions. Migrations are executed using SQLite's batch-migration mode to support table alterations safely.

```bash
# Check current migration revision
python3 -m alembic current

# Upgrade database to latest revision
python3 -m alembic upgrade head

# Create a new migration revision after modifying models
python3 -m alembic revision -m "add_custom_field"
```

---

## 5. Local Backup & Disaster Recovery

The platform includes a built-in backup and safe restore subsystem accessible both via the UI Settings page and the REST API.

### Exporting Database Backup
```bash
# Export binary snapshot
curl -O http://localhost:3000/api/backup/export
```

### Restoring Database Backup
Restoration overwrites the active database file and requires explicit confirmation. An automatic pre-restore backup (`.db.pre_restore_bak`) is generated before the file is replaced:

```bash
curl -X POST http://localhost:3000/api/backup/restore \
  -F "file=@agent_crash_test_backup.db" \
  -F "confirmation=CONFIRM"
```

---

## 6. Docker Deployment (Optional Alternative)

For multi-container or production-like environments:

```bash
# Build and run containers
docker compose up --build -d

# Verify container health
docker compose ps
```

Exposed ports:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000` (or `8001` in local proxy mode)
