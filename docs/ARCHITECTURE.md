# Agent Crash Test — Architecture Document

## 1. System Architecture Overview

Agent Crash Test is structured as a decoupled, multi-tier system composed of an operations frontend, an authoritative Python FastAPI backend service, a persistent local-first SQLite storage engine, and a transparent development proxy.

```
+-----------------------------------------------------------------------------------------+
|                                    USER BROWSER                                         |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                    Frontend SPA: Cyber Operations Dashboard                     |   |
|   |             (React 19, TypeScript, Tailwind CSS, Lucide, Motion)               |   |
|   +---------------------------------------------------------------------------------+   |
+--------------------------------------------|--------------------------------------------+
                                             | HTTP / REST (/api/*)
                                             v
+-----------------------------------------------------------------------------------------+
|                                    DEV HOST & PROXY                                     |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                      Express 4 / Vite Development Server                        |   |
|   |  - Port 3000: Serves React 19 Frontend                                         |   |
|   |  - Automatically spawns FastAPI backend (127.0.0.1:8001)                        |   |
|   |  - Transparent streaming reverse proxy (/api/* -> FastAPI)                      |   |
|   +---------------------------------------------------------------------------------+   |
+--------------------------------------------|--------------------------------------------+
                                             | HTTP / REST (Direct internal forwarding)
                                             v
+-----------------------------------------------------------------------------------------+
|                              AUTHORITATIVE BACKEND TIER                                 |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                    Python FastAPI Service (127.0.0.1:8001)                      |   |
|   |  - Core Config & Sanitized Structured Logging                                   |   |
|   |  - Health & Readiness Telemetry (/api/health, /api/ready, /api/version)         |   |
|   |  - Full CRUD: Scenarios, Test Runs, Execution Events, Reports, Settings         |   |
|   |  - Backup & Export Subsystem (/api/backup/export, /api/backup/restore)          |   |
|   |  - Report Serialization: JSON and CSV format exports                            |   |
|   +---------------------------------------------------------------------------------+   |
|                                            |                                            |
|                                            v (SQLAlchemy 2.x / Session Factory)         |
|   +---------------------------------------------------------------------------------+   |
|   |             Local-First Persistent SQLite Database: data/agent_crash_test.db     |   |
|   |  - Schema Migrations via Alembic (Revisions 0001, 0002)                         |   |
|   |  - PRAGMAs: foreign_keys=ON, busy_timeout=5000, journal_mode=WAL                |   |
|   |  - Tables: test_scenarios, test_runs, execution_events, test_reports,            |   |
|   |            application_settings, alembic_version                                |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+

===========================================================================================
FUTURE PHASES (PLANNED ARCHITECTURE — STRICTLY DEFERRED IN PHASE 1)
===========================================================================================
  [Planned Phase 2: Mock CRM] <---> [Planned Phase 5: Isolated Docker Sandbox]
                                              ^
                                              | (Adversarial Prompts & Scenarios)
                                    [Planned Phase 3: AI Business Agent]
                                              | (Playwright Tool Actions)
                                    [Planned Phase 5: Evidence & Action Recorder]
                                              |
                                    [Planned Phase 4: Deterministic Evaluator]
```

---

## 2. Implemented Foundation Components (Phase 1 Local-First Persistence)

### A. Frontend Tier
- **Framework**: React 19 SPA powered by Vite 8 with TypeScript and Tailwind CSS v4.
- **Cyber Operations Center UI**: Adheres to the dark operations theme (`#080B10` background, `#111722` surfaces, `#8B5CF6` electric purple, `#38BDF8` cyan, `#B6FF4A` neon green).
- **Navigation & Routing**: Clean sidebar navigation across Overview, Test Scenarios, Test Runs, Reports, Attack Library, and Settings.
- **Dynamic Database Integration**:
  - Live data query on page mount; no hardcoded demo fallback silently replacing failed requests.
  - Interactive scenario creator and category filter.
  - Test run recording modal, run detail drawer, and live event trace inspector.
  - Report card viewer with direct JSON and CSV export downloads.
  - Settings page with live SQLite disk usage telemetry, binary database export, confirmed restore dialog (`CONFIRM`), and database re-seed triggers.

### B. Backend Tier (Authoritative FastAPI Service)
- **Framework**: Python 3.12+ with FastAPI, Pydantic v2 validation, and Uvicorn runtime.
- **Single Source of Truth**: All database read/write logic lives solely in the FastAPI backend; the Node.js layer does not duplicate persistence code.
- **Process Health & Telemetry**:
  - `GET /api/health`: Instant process liveness check.
  - `GET /api/ready`: Real database ping (`SELECT 1`), returning `connected` or `disconnected`.
  - `GET /api/version`: Application semantic versioning.
- **REST CRUD Endpoints**:
  - `/api/scenarios`: Full scenario library CRUD with category filtering.
  - `/api/runs`: Test run execution tracking with nested execution event creation.
  - `/api/reports`: Test run evaluation summaries with forensic evidence exports (JSON and CSV).
  - `/api/settings`: Application and engine configuration storage with secret masking.
  - `/api/backup`: Complete binary SQLite export, safe atomic restore with confirmation token, and telemetry.

### C. Persistent Storage Engine
- **Engine**: SQLite 3 with absolute file path resolution (`<workspace>/data/agent_crash_test.db`).
- **Connection Safety & Concurrency**:
  - `foreign_keys = ON`: Strict referential integrity enforcement.
  - `busy_timeout = 5000`: Graceful lock resolution under concurrent connections.
  - `journal_mode = WAL`: Write-Ahead Logging for high read/write concurrency.
  - `check_same_thread = False`: Multi-threaded session safety across async endpoints.
- **Schema Management via Alembic**:
  - `0001_initial_foundation`: Base schema configuration.
  - `0002_local_first_persistence`: Full schema with `test_scenarios`, `test_runs`, `execution_events`, `test_reports`, and `application_settings`.
- **Durability Guarantee**: Survives browser reloads, backend restarts, frontend restarts, and system reboots.

---

## 3. Planned Architecture (Deferred to Phases 2-6)

1. **Phase 2 — Mock Business Environment**: A simulated e-commerce CRM with orders, customers, and refund policies.
2. **Phase 3 — AI Business Agent**: Integration with Vultr Serverless Inference LLMs (Llama-3, Mistral) executing business tasks via tool calls.
3. **Phase 4 — Crash Scenarios**: Adversarial prompt injector and failure injector.
4. **Phase 5 — Sandbox & Evidence**: Ephemeral Docker sandbox runner with Playwright headless browser automation and screenshot recorder.
5. **Phase 6 — Deployment & Demo**: Automated Vultr Cloud Compute deployment script.
