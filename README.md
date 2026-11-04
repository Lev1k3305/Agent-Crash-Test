# Agent Crash Test — AI Agent Reliability & Security Platform

[![Phase](https://img.shields.io/badge/Milestone-Phase%201%20Foundation-8B5CF6)](./docs/MVP_ROADMAP.md)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)

> **"Evaluate what an AI agent actually does, not only what it says."**

Agent Crash Test is an automated reliability and security stress-testing platform for AI agents operating in enterprise business workflows. Rather than judging conversational output, the platform executes agents in isolated sandboxes, exposes them to adversarial prompt injections, policy edge cases, and API failures, and evaluates their concrete actions on databases and APIs.

---

## Current Status: Phase 1 — Local-First Persistence Foundation

This repository implements **Phase 1 — Local-First Persistence Foundation**. It establishes the complete monorepo architecture, Cyber Operations Center frontend, FastAPI backend with health and readiness telemetry, local-first persistent SQLite database with Write-Ahead Logging (WAL) and foreign key enforcement, Alembic schema migrations, binary database backup/restore with confirmation token, and JSON/CSV report exports.

*Note: In accordance with Phase 1 boundaries, no AI agents, LLM integrations, sandbox execution runners, or attack scenarios are implemented in this phase.*

---

## 1. Technology Stack

- **Frontend**: React 19, TypeScript 5, Vite 8, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.x, Alembic.
- **Database**: Local-First SQLite 3 (`data/agent_crash_test.db`) with WAL journal mode and foreign key enforcement.
- **Infrastructure**: Express reverse proxy (`server.ts`), Docker Compose fallback.
- **Testing**: Vitest, React Testing Library, Pytest, Python persistence lifecycle test suite.

---

## 2. Repository Structure

```
agent-crash-test/
├── frontend/                     # Frontend container files & build configuration
│   └── Dockerfile
├── backend/                      # Python FastAPI backend service
│   ├── app/
│   │   ├── api/routes/           # API routes: /api/health, /api/ready, /api/version
│   │   ├── core/                 # Config (Pydantic) & credential-safe logging
│   │   ├── db/                   # SQLAlchemy engine, session pool, and DB health check
│   │   ├── schemas/              # Pydantic v2 request/response schemas
│   │   ├── services/             # Health, readiness, and version services
│   │   └── main.py               # FastAPI app entry with explicit CORS
│   ├── tests/                    # Backend unit & integration test suites
│   ├── alembic/                  # Alembic migration environment & scripts
│   ├── pyproject.toml            # Python packaging & dependencies
│   ├── alembic.ini               # Alembic configuration
│   └── Dockerfile                # Multi-stage non-root container build
├── sandbox/
│   └── README.md                 # Sandbox execution module specification (Phase 5)
├── docs/                         # Architecture, security, and project documentation
│   ├── PROJECT_SPEC.md           # Product goals, scope, and acceptance criteria
│   ├── ARCHITECTURE.md           # Architecture overview and phase breakdown
│   ├── MVP_ROADMAP.md            # 6-phase roadmap from Foundation to Vultr demo
│   ├── SECURITY_MODEL.md         # Baseline security controls and practices
│   ├── THREAT_MODEL.md           # STRIDE threat model
│   ├── API_SPEC.md               # Implemented REST API documentation
│   ├── DATA_MODEL.md             # Database schema and pooling documentation
│   ├── TEST_SCENARIOS.md         # Planned stress-testing business scenarios
│   ├── EVALUATION.md             # Deterministic evaluation methodology
│   └── DEPLOYMENT.md             # Docker Compose & planned Vultr deployment
├── src/                          # React Cyber Operations Center application source
│   ├── components/layout/        # CyberSidebar, CyberHeader, CyberShell
│   ├── components/dashboard/     # Overview, RiskScore, SystemVisualizer, LiveTracePreview
│   ├── pages/                    # Overview, TestScenarios, TestRuns, Reports, Settings
│   ├── services/                 # Backend API client (/api/health, /api/ready, /api/version)
│   └── types/                    # System status and scenario TypeScript types
├── docker-compose.yml            # Complete multi-service local stack
├── .env.example                  # Safe environment template
├── .gitignore                    # Version control exclusions
└── README.md                     # Main documentation index
```

---

## 3. Quick Start with Docker Compose

### Prerequisites
- Docker Engine $\ge 24.0$
- Docker Compose v2

```bash
# 1. Clone repository
git clone https://github.com/org/agent-crash-test.git
cd agent-crash-test

# 2. Copy environment configuration
cp .env.example .env

# 3. Start Frontend, Backend, and PostgreSQL services
docker compose up --build -d

# 4. Check service status
docker compose ps
```

The services will be available at:
- **Cyber Operations Dashboard**: `http://localhost:3000`
- **Backend API Health**: `http://localhost:8000/api/health`
- **Backend Database Readiness**: `http://localhost:8000/api/ready`
- **Backend Version Metadata**: `http://localhost:8000/api/version`

---

## 4. Local-First Development & Windows Startup

Agent Crash Test operates as an authoritative local-first application. The database is persistent SQLite (`data/agent_crash_test.db`) stored directly on your computer.

### Windows One-Click Quick Start (PowerShell)
```powershell
.\start-local.ps1
```
This automatically verifies dependencies, runs Alembic migrations, and launches both FastAPI and Vite in separate console windows.

---

### Native Dual-Process Execution (Cross-Platform)

#### Terminal 1: Python FastAPI Service
```bash
# 1. Install dependencies
pip install fastapi uvicorn pydantic-settings sqlalchemy alembic httpx python-dotenv

# 2. Run Alembic schema migrations
python -m alembic upgrade head

# 3. Start authoritative FastAPI backend on port 8000
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- **Backend API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/api/docs`
- **SQLite Database Path**: `data/agent_crash_test.db`

#### Terminal 2: React 19 + Vite Frontend
```bash
# 1. Install dependencies
npm install   # or: bun install

# 2. Start Vite development server
npm run dev   # or: bun run dev
```
- **Frontend URL**: `http://localhost:3000` (or `http://localhost:5173`)

---

## 5. Vercel Static Frontend Deployment

Vercel is used **strictly for static frontend hosting** (React 19 + Vite SPA). The backend and database remain local on the user's computer.

### Required Vercel Project Settings:
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `vite build` (or `npm run build` / `bun run build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install` (or `bun install`)
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `http://127.0.0.1:8000` (points client browser to local FastAPI backend)

Direct navigation to SPA routes (`/dashboard`, `/scenarios`, `/runs`, `/reports`) is routed to `index.html` via `vercel.json`.

---

## 6. Automated Quality Checks

Run all verification suites:

```bash
# 1. Backend unit & persistence tests
PYTHONPATH=. python3 backend/tests/run_tests.py

# 2. Full 9-step persistence lifecycle verification
PYTHONPATH=. python3 backend/tests/verify_persistence_lifecycle.py

# 3. Frontend unit tests
npm test   # or: bun run test

# 4. TypeScript validation
npm run lint   # or: bun run lint

# 5. Production build
npm run build  # or: bun run build
```

---

## 7. Troubleshooting

- **Backend Offline in UI Banner**: Verify FastAPI is running on `http://127.0.0.1:8000`. The frontend displays a real-time banner when the local backend is unreachable.
- **CORS Errors**: Ensure `CORS_ORIGINS` in `.env` includes your client's host origin (`http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173`).
- **Database Backup**: Binary snapshots can be exported directly from the Settings page or via `GET http://127.0.0.1:8000/api/backup/export`.

---

## 7. Documentation Directory

Refer to the `/docs` directory for complete architectural specifications:
- [Product Specification](./docs/PROJECT_SPEC.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [MVP Roadmap](./docs/MVP_ROADMAP.md)
- [Security Model](./docs/SECURITY_MODEL.md)
- [Threat Model](./docs/THREAT_MODEL.md)
- [API Specification](./docs/API_SPEC.md)
- [Data Model](./docs/DATA_MODEL.md)
- [Test Scenarios](./docs/TEST_SCENARIOS.md)
- [Evaluation Methodology](./docs/EVALUATION.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
