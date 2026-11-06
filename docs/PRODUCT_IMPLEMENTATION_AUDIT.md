# AGENT CRASH TEST — PRODUCT IMPLEMENTATION & ARCHITECTURAL AUDIT (STAGE 0)

**Document Version:** 1.0.0
**Date:** March 2025 (Audit Baseline)
**Repository:** `Lev1k3305/Agent-Crash-Test`
**Scope:** Stage 0 Full Repository Audit, Gap Analysis, Technical Specification, and Multi-Stage Implementation Roadmap.

---

## 1. Executive Summary

Agent Crash Test was founded on a distinct core premise:
> *"Evaluate what an AI agent actually does, not only what it says."*

The repository currently contains **Phase 1: Local-First Persistence Foundation**. It possesses a functioning monorepo foundation with:
- A React 19 + TypeScript 5 + Vite + Tailwind CSS frontend designed with an enterprise dark theme.
- An authoritative Python FastAPI backend running at `http://127.0.0.1:8000`.
- A persistent local SQLite database located at `data/agent_crash_test.db` with Write-Ahead Logging (WAL) and foreign keys enabled.
- Alembic database migration management (`0001_initial_foundation`, `0002_local_first_persistence`).
- Binary database backup and restore routines with strict confirmation safeguards.

However, the current platform functions primarily as a **manual CRUD telemetry logger** rather than an **active, automated AI Agent reliability and adversarial stress-testing platform**. While the database schema supports storing test runs, execution events, and forensic reports, test execution is either simulated by inserting canned default events or manually entered through a modal form. No actual agent execution engine, provider adapter interface, runtime isolation sandbox, or deterministic evaluation logic currently exists in the codebase.

This document presents a granular, evidence-based audit of all codebase components, details the functional and security gaps, and defines the roadmap for Stage 1 (Premium Cybersecurity Redesign), Stage 2 (Real Testing Engine), Stage 3 (Data, Reports & Analytics), and Stage 4 (Quality Assurance).

---

## 2. Current Architecture

### 2.1 Monorepo Topology
```
agent-crash-test/
├── frontend/                     # Container configuration (Dockerfile)
├── backend/                      # Python FastAPI service
│   ├── alembic/                  # Alembic environment & migration versions
│   │   └── versions/             # 0001_initial_foundation.py, 0002_local_first_persistence.py
│   ├── app/
│   │   ├── api/routes/           # health, ready, version, scenarios, runs, reports, settings, backup
│   │   ├── core/                 # config.py (Pydantic Settings), logging.py
│   │   ├── db/                   # session.py (SQLAlchemy engine, WAL PRAGMA, init_db, seed_initial_data)
│   │   ├── models/               # base, scenario, run, event, report, setting
│   │   ├── schemas/              # Pydantic v2 schemas for all models
│   │   └── main.py               # FastAPI application with CORS and route registration
│   ├── tests/                    # Unit, CRUD, and persistence verification test suites
│   ├── alembic.ini               # Alembic configuration pointing to data/agent_crash_test.db
│   └── pyproject.toml            # Backend dependencies managed by uv / pip
├── data/                         # Local database directory
│   └── agent_crash_test.db       # Persistent SQLite 3 file
├── docs/                         # Specification and design docs
├── sandbox/                      # Architectural placeholder (Phase 5 deferred)
├── src/                          # React 19 frontend
│   ├── components/
│   │   ├── dashboard/            # StatCards, SystemVisualizer, RiskScoreCard, LiveTracePreview
│   │   └── layout/               # CyberSidebar, CyberHeader
│   ├── hooks/                    # useBackendStatus (polling /api/health and /api/ready)
│   ├── pages/                    # Overview, TestScenarios, TestRuns, Reports, AttackLibrary, Settings
│   ├── services/                 # api.ts (REST client targeting VITE_API_BASE_URL)
│   ├── types/                    # TypeScript interfaces
│   ├── App.tsx                   # App shell, navigation state, offline backend warning banner
│   └── main.tsx                  # React DOM mount point
├── server.ts                     # Local Express development reverse proxy
├── package.json                  # Frontend packages managed by Bun / Vite
├── vercel.json                   # Static Vite SPA rewrite configuration
└── vite.config.ts                # Vite build config with Tailwind CSS v4 & React plugin
```

### 2.2 Deployment & Boundary Rules
- **Static Hosting (Vercel)**: Vercel strictly hosts the static React + Vite client bundle (`dist/`). All route navigation is rewritten to `index.html`. No Node.js or Python serverless functions are deployed to Vercel.
- **Authoritative Backend**: FastAPI runs locally on the user's workstation (`http://127.0.0.1:8000`). If the backend is stopped, the frontend safely displays a prominent "Local Backend Offline" banner and informs the user to start the local service.
- **Database Boundary**: `data/agent_crash_test.db` is strictly local SQLite. No cloud databases (Supabase, Vultr, Firebase) are used.

---

## 3. Implemented Functionality

The following capabilities are implemented and verified by automated tests:

1. **Local Persistent Storage**:
   - SQLite 3 with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) and foreign keys enforced (`PRAGMA foreign_keys=ON`).
   - SQLite busy timeout configured to 5000ms.
   - Database survives process crashes and application restarts (verified by `verify_persistence_lifecycle.py`).
2. **Schema & Migration Pipeline**:
   - Alembic revisions:
     - `0001_initial_foundation`: Base schema tracking.
     - `0002_local_first_persistence`: Tables for `test_scenarios`, `test_runs`, `execution_events`, `test_reports`, `application_settings`.
   - Idempotent database initialisation (`init_db`) that creates missing tables without dropping existing records.
   - Initial scenario baseline seeding (`seed_initial_data`) providing 6 default adversarial scenarios (`SEC-01`, `BUS-01`, `REL-01`, `REL-02`, `BUS-02`, `SEC-02`).
3. **Backend REST APIs**:
   - `/api/health`: Service health and timestamp.
   - `/api/ready`: Database connectivity check via `SELECT 1`.
   - `/api/version`: Platform metadata and semantic versioning.
   - `/api/scenarios`: Full CRUD, search filtering by keyword, category filtering, active state filtering.
   - `/api/runs`: CRUD for test runs with pagination, cascade deletion of related events and reports, filtering by status and result.
   - `/api/runs/{run_id}/events`: Listing and appending execution events.
   - `/api/reports`: CRUD for forensic reports, JSON export (`/export?format=json`), and CSV export (`/export?format=csv`).
   - `/api/settings`: Upsert and query for application key-value configuration.
   - `/api/backup/status`: Disk file existence, file size, formatted size, and live table counts.
   - `/api/backup/export`: Point-in-time binary database download using the SQLite Online Backup API.
   - `/api/backup/restore`: Base64 backup restoration requiring explicit `"CONFIRM"` confirmation string with pre-restore safety copy.
4. **Frontend Cyber Operations Dashboard**:
   - Multi-page navigation (Overview, Test Scenarios, Test Runs, Reports, Attack Library, Settings).
   - Real-time backend status polling (`useBackendStatus` hook) indicating connection state, response latency, and database readiness.
   - Creation modal for custom scenarios and manual test runs.
   - Detailed event trace modal for inspecting run telemetry.
   - Settings page for exporting and restoring binary database backups.

---

## 4. Incomplete & Missing Functionality

Despite the robust persistence layer, critical product features required for an autonomous AI agent testing platform are incomplete:

1. **No Real Agent Execution Engine**:
   - Clicking "Record Test Run" on the Test Runs page simply displays a form where the user manually selects "PASSED" or "FAILED", inputs an arbitrary duration and risk score, and optionally ticks "create_default_events".
   - The backend `POST /api/runs` generates static hardcoded synthetic events (`"Navigate to /orders/1042"`, `"Read order details"`, `"Execute transaction tool: process_refund()"`).
   - There is no runtime engine that dispatches prompts to an agent, manages communication, captures responses, or monitors tool calls.
2. **Missing Agent Adapter Interface**:
   - The platform has no abstraction or connector layer to interface with different agent frameworks (e.g. LangChain, CrewAI, AutoGen, OpenAI Assistants API, direct HTTP webhooks, or local CLI agents).
3. **Absence of Real Target Environments & Mock Fixtures**:
   - Scenarios reference `"E-commerce CRM"`, but there is no actual mock CRM service, sandboxed API, or simulated environment for an agent to interact with.
4. **No Automated Behavior Evaluation**:
   - Evaluation is currently predetermined by user selection on run creation. There is no automated evaluator that checks whether the agent followed safety policies, refused prompt injections, or executed unauthorized actions.
5. **No Live Execution Progress / Streaming Telemetry**:
   - Test runs are saved in a static `COMPLETED` state. There is no `RUNNING` state with live streaming of execution events (e.g. via Server-Sent Events or WebSockets) as an agent performs actions.
6. **Cancellation Mechanism Missing**:
   - The backend cannot cancel or abort an in-flight test run because runs do not execute asynchronously in background tasks.

---

## 5. Mock or Placeholder Functionality Audit

| Component | Current State | Defect / Limitation |
|---|---|---|
| `src/components/dashboard/LiveTracePreview.tsx` | Static JSX UI with hardcoded fake telemetry (`Run #0024`, duration `01:24`, simulated CRM window) | Marked as "Phase 4/5 Preview"; disconnected from live SQLite data. Does not reflect real agent runs. |
| `src/components/dashboard/SystemVisualizer.tsx` | Static SVG/flex diagram depicting Adversarial Input → AI Agent → Target System | Informational diagram only; does not show active topology or live connections. |
| `src/pages/AttackLibraryPage.tsx` | Hardcoded in-memory array (`attackTaxonomy`) of 4 categories | Not backed by SQLite database or backend API; changes cannot be persisted. |
| `backend/app/api/routes/runs.py` (`POST /api/runs`) | Hardcoded event generation if `create_default_events=True` | Generates identical dummy CRM order events (#1042) for all scenarios regardless of category. |
| `src/pages/ReportsPage.tsx` | Displays report cards and downloads JSON/CSV | No PDF export functionality. Evidence is limited to a brief text summary string. |

---

## 6. Missing Backend Endpoints

To transform the platform into a real testing engine, the following backend endpoints are needed:

1. **Agent Integration & Configuration**:
   - `GET /api/agents` — List configured target agents.
   - `POST /api/agents` — Register an agent under test (type: HTTP webhook, OpenAI-compatible API, CLI, or Local Fixture).
   - `GET /api/agents/{agent_id}` / `PUT /api/agents/{agent_id}` / `DELETE /api/agents/{agent_id}` — Manage agent profiles.
   - `POST /api/agents/{agent_id}/ping` — Test connectivity to the agent target.
2. **Active Test Execution Lifecycle**:
   - `POST /api/runs/execute` — Trigger an automated test run for a specified agent and scenario (or scenario suite) with isolation constraints.
   - `POST /api/runs/{run_id}/cancel` — Abort a running execution safely.
   - `GET /api/runs/{run_id}/stream` — Server-Sent Events (SSE) or WebSocket endpoint for live log and event streaming.
3. **Attack Library Catalog**:
   - `GET /api/attack-library` — Retrieve structured attack vectors and taxonomy from the backend database.
4. **Report Export Capabilities**:
   - `GET /api/reports/{report_id}/export?format=pdf` — Generate and download a formatted PDF executive security report.

---

## 7. Database & Migration Gaps

The current SQLite database schema has several gaps:

1. **No `agents` Table**:
   - Currently, `test_runs.target_system` is a plain string (`"E-commerce CRM"`).
   - A dedicated `agents` table is needed to store agent name, adapter type (`http`, `openai`, `local_fixture`), base URL, authentication headers (encrypted/masked), timeouts, and authorization flags.
2. **Execution Parameters & Inputs on `test_runs`**:
   - `test_runs` lacks fields for:
     - `agent_id` (foreign key to `agents.id`).
     - `execution_config` (JSON field containing timeout, temperature, max steps, payload options).
     - `error_message` (for run-level failures/timeouts).
3. **Deterministic Evaluation Fields on `execution_events`**:
   - `execution_events` stores `event_type`, `message`, `details`, `status`.
   - Needs structured columns or JSON for `payload_input`, `raw_response`, and `latency_ms`.
4. **Structured Evidence on `test_reports`**:
   - `test_reports` has `findings_summary` and `evidence_summary` as plain text.
   - Needs structured evidence storage (`evidence_records` table or structured JSON) linking specific events to policy violations and risk scoring breakdowns.
5. **Attack Taxonomy Table**:
   - `attack_vectors` table to store attack taxonomy, categories, severity, and evaluation criteria currently hardcoded in `AttackLibraryPage.tsx`.

*All schema additions must be executed via Alembic migrations (`0003_...`) without altering existing data or breaking existing tables.*

---

## 8. Agent Execution Architecture

### 8.1 Adapter Interface Design
AI agents in the enterprise ecosystem do not share a single standardized communication protocol. The platform must implement a provider-independent `BaseAgentAdapter`:

```python
class BaseAgentAdapter(ABC):
    @abstractmethod
    async def ping(self) -> bool:
        """Check agent reachability."""
        pass

    @abstractmethod
    async def invoke(self, payload: AgentExecutionRequest) -> AgentExecutionResponse:
        """Execute a single test interaction turn."""
        pass
```

Implementations:
1. **Local Test Fixture Adapter (`FixtureAgentAdapter`)**:
   - A clearly labeled, deterministically controlled local test fixture.
   - Simulates realistic agent behaviors across test categories (e.g., vulnerable agent that caves to prompt injection, hardened agent that refuses directive overrides, brittle agent that throws 500 errors on API timeouts).
   - Allows complete, reproducible automated testing without external API keys or network dependencies.
2. **HTTP Webhook Adapter (`HttpWebhookAdapter`)**:
   - Dispatches structured JSON payloads to any REST/webhook agent endpoint.
   - Supports custom headers and Bearer token authentication.
3. **OpenAI-Compatible Chat Adapter (`OpenAICompatibleAdapter`)**:
   - Connects to standard OpenAI/v1/chat/completions compatible endpoints (vLLM, Ollama, LM Studio, LiteLLM, OpenAI).

### 8.2 Testing Lifecycle Engine
The execution lifecycle must follow a deterministic state machine:
```
[PENDING]
   └── Validate Target Authorization & Limits
       └── [INITIALIZING]
           └── Setup Isolated Context & Test Payload
               └── [RUNNING]
                   ├── Dispatch Prompt Vector
                   ├── Stream Execution Events
                   ├── Capture Agent Actions & Responses
                   └── [EVALUATING]
                       ├── Evaluate Behavior Rules
                       ├── Calculate Multi-dimensional Risk Score
                       └── [COMPLETED] / [FAILED] / [CANCELLED]
                           ├── Persist Run & Events in SQLite
                           └── Generate Forensic Test Report
```

---

## 9. Security Isolation Risks & Mitigation

Because Agent Crash Test subjects agents to adversarial prompt injections, privilege escalation vectors, and simulated tool abuse, rigorous isolation boundaries must be enforced:

1. **Target Authorization**:
   - Risk: Malicious or accidental testing of unauthorized third-party production infrastructure.
   - Mitigation: Strict target authorization flag. Test runs will only execute against `127.0.0.1`, `localhost`, explicitly configured private subnets, or verified test fixture targets.
2. **No Arbitrary Code/Host Execution**:
   - Risk: Agents attempting tool calls that run host shell commands (`bash`, `subprocess`, `rm -rf`).
   - Mitigation: The runner never evaluates or passes agent output to the host operating system shell. Tool execution is strictly simulated within a controlled virtual mock layer.
3. **Execution Timeouts & Step Throttles**:
   - Risk: Infinite loops, prompt injection recursion, or denial-of-service hanging the backend.
   - Mitigation: Hard execution timeout (default: 30 seconds per scenario turn) and maximum tool step limit (default: 5 turns). Background tasks monitor active process timeouts.
4. **Data Privacy & Secret Sanitization**:
   - Risk: API keys, tokens, or PII logged in plain text in SQLite database or exported in reports.
   - Mitigation: Credential masking on all logged events and report exports. Sensitive setting values masked in API responses.

---

## 10. UI/UX Weaknesses & Redesign Specification (Stage 1)

### 10.1 Identified Weaknesses
1. **Inconsistent Dark Tones**:
   - Colors range between `#0B0D12`, `#0E1118`, `#111722`, and Tailwind `slate-800`.
   - Lacks the cohesive, polished visual identity expected of modern cybersecurity operations platforms.
2. **Mock Elements in Production Interface**:
   - `LiveTracePreview` displays static hardcoded strings ("Order #1042", "₸ 24,900", "01:24") that do not respond to user actions.
   - `AttackLibraryPage` has static vector cards with no connection to the backend database.
3. **Cluttered Modals & Unstructured Forms**:
   - "Record Test Run" modal requires manually typing durations and selecting pass/fail status, which confuses users expecting an automated test runner.
4. **Absence of Real-Time Execution Feedback**:
   - No interactive console, live terminal trace, or step-by-step progress tracker during active runs.

### 10.2 Stage 1 Premium Cybersecurity Visual Specification
- **Palette**:
  - Background: `#090B10`
  - Sidebar: `#0D1017`
  - Surface Card: `#121722`
  - Elevated Card: `#181F2B`
  - Subtle Borders: `#252D3B` (with `rgba(255, 255, 255, 0.07)` highlights)
  - Primary Accent: `#8B5CF6` (Cyber Violet)
  - Secondary Accent: `#38BDF8` (Tactical Cyan)
  - Status Success: `#22C55E`
  - Status Warning: `#F59E0B`
  - Status Critical: `#EF4444`
  - Text: Primary `#F1F5F9`, Secondary `#94A3B8`, Muted `#64748B`
- **Typography & Details**:
  - Crisp monospace font (`JetBrains Mono` / system monospace) for codes, hashes, latency, and telemetry.
  - Subdued, purposeful status indicators (no distracting neon glow or decorative animations).
  - High-density data tables with clear typography hierarchy and instant filtering.

---

## 11. Recommended Implementation Sequence

### Stage 1: Premium Cybersecurity Redesign
- Standardize the design system and color palette across all pages and components.
- Modernize the Shell, Header, Sidebar, Overview, Scenarios, Runs, Reports, Attack Library, and Settings pages.
- Remove fake/mock UI representations (such as static fake terminal progress) in favor of clean, data-driven cybersecurity components.
- Ensure 100% responsiveness and accessibility across desktop and tablet viewport widths.

### Stage 2: Real Testing Engine & Agent Integration
- Implement `BaseAgentAdapter` and create:
  - `FixtureAgentAdapter`: Deterministic local fixture with configurable security behaviors (Compliant, Vulnerable, Brittle, Leaky).
  - `HttpWebhookAdapter`: Live HTTP/JSON agent caller.
- Implement `TestExecutionEngine` with asynchronous background task management, step timeouts, and safe cancellation.
- Implement deterministic evaluation rules across the core security categories:
  - Prompt Injection Resistance (`SEC-01`)
  - Cross-Tenant Data Isolation (`BUS-01`)
  - Transaction Idempotency & Race Conditions (`REL-01`)
  - Fault Injection & Downstream Resilience (`REL-02`)
  - Business Policy & Authorization Boundaries (`BUS-02`)
  - Sensitive Data & System Prompt Confidentiality (`SEC-02`)
- Add backend routes: `POST /api/runs/execute`, `POST /api/runs/{run_id}/cancel`, and agent configuration endpoints.
- Update frontend Test Runs page to trigger real automated runs, select target agents and scenarios, monitor live execution progress, and safely abort in-flight tests.

### Stage 3: Data, Reports & Analytics
- Create Alembic migration `0003_agent_execution_engine.py` to add `agents` and `attack_vectors` tables, plus execution metadata columns on `test_runs` and `execution_events`.
- Implement dynamic Attack Library persistence connected to backend database.
- Enhance report generation with detailed findings breakdowns, risk metrics, and evaluation evidence.
- Implement downloadable PDF forensic report export in addition to JSON and CSV.
- Populate analytics on the Overview dashboard derived strictly from real database records.

### Stage 4: Quality Assurance & Hardening
- Comprehensive test coverage:
  - Frontend: Unit tests, component tests, routing checks, offline fallback verification.
  - Backend: Unit tests, persistence tests, migration upgrade/downgrade verification, execution engine lifecycle tests, timeout and cancellation tests.
- Verification under edge conditions: empty database, offline backend, slow network, corrupted inputs.
- Final security audit: credential sanitization, timeout enforcement, target authorization verification.

---

## 12. Acceptance Criteria by Stage

### Stage 1 Acceptance Criteria
- [ ] Cohesive, professional enterprise cybersecurity aesthetic implemented across all pages using the specified palette (`#090B10`, `#0D1017`, `#121722`, `#252D3B`, `#8B5CF6`, `#38BDF8`).
- [ ] No fake or hardcoded mock traces in the primary UI views; all cards reflect real state or clear empty states.
- [ ] Layout is fully responsive without clipping or horizontal overflow.
- [ ] Frontend test suite (`bun run test`), TypeScript check (`bun run lint`), and production build (`bun run build`) pass with zero errors.

### Stage 2 Acceptance Criteria
- [ ] `BaseAgentAdapter` interface established with both `FixtureAgentAdapter` and `HttpWebhookAdapter` implementations.
- [ ] Real execution lifecycle (`POST /api/runs/execute`) executes scenarios asynchronously without blocking the server.
- [ ] Live execution events and evidence are persisted to SQLite in real time.
- [ ] In-flight runs can be cancelled cleanly via `POST /api/runs/{run_id}/cancel`.
- [ ] Deterministic evaluation rules produce verifiable PASS/FAIL outcomes based on actual agent responses and actions.
- [ ] Strict isolation: timeout enforcement, no host shell execution, controlled inputs.

### Stage 3 Acceptance Criteria
- [ ] Alembic migration `0003` applies cleanly without destroying existing database records.
- [ ] Target agents and attack taxonomy are fully persisted in SQLite.
- [ ] Forensic reports feature detailed evidence timelines and exportable PDF, JSON, and CSV documents.
- [ ] Overview dashboard displays live analytics computed directly from SQLite test runs.

### Stage 4 Acceptance Criteria
- [ ] 100% pass rate on all backend tests (`PYTHONPATH=. python3 backend/tests/run_tests.py` and `verify_persistence_lifecycle.py`).
- [ ] 100% pass rate on frontend tests and build.
- [ ] Clean handling of backend offline state, invalid agent URLs, timeouts, and empty database states.
- [ ] Database backup and restore verified with end-to-end checksum verification.
