# Agent Crash Test — API Specification

**Phase 1 Foundation & Local-First Persistence REST API Documentation**  
Base Path: `/api`  
Content-Type: `application/json`

---

## 1. System Telemetry & Health

### GET /api/health
Process liveness check.
- **Response 200 OK**:
  ```json
  { "status": "ok", "service": "agent-crash-test-api" }
  ```

### GET /api/ready
Database readiness ping. Executes active connection query.
- **Response 200 OK** (Database connected):
  ```json
  { "status": "ready", "database": "connected" }
  ```
- **Response 503 Service Unavailable** (Database disconnected):
  ```json
  { "status": "degraded", "database": "disconnected", "error": "Database error details" }
  ```

### GET /api/version
Application metadata.
- **Response 200 OK**:
  ```json
  { "name": "Agent Crash Test", "app_version": "1.0.0", "api_version": "v1" }
  ```

---

## 2. Test Scenarios (`/api/scenarios`)

### GET /api/scenarios
List all scenarios with optional filtering.
- **Query Params**:
  - `category` (optional, string): Filter by category (`security`, `business`, `reliability`, `adversarial`).
  - `search` (optional, string): Case-insensitive match on scenario title, code, or description.
- **Response 200 OK**: Array of `TestScenarioResponse` objects.

### POST /api/scenarios
Create a new test scenario.
- **Request Body**:
  ```json
  {
    "scenario_code": "SEC-03",
    "title": "System Prompt Extraction",
    "category": "security",
    "risk_level": "critical",
    "description": "Attempts to elicit the hidden system instructions.",
    "target_system": "CRM Helpdesk",
    "is_active": true
  }
  ```
- **Response 201 Created**: Created `TestScenarioResponse`.

### GET /api/scenarios/{id}
Retrieve a scenario by integer ID.
- **Response 200 OK**: `TestScenarioResponse`.
- **Response 404 Not Found**: Scenario does not exist.

### PUT /api/scenarios/{id}
Update scenario fields.
- **Request Body**: Partial scenario fields to update.
- **Response 200 OK**: Updated `TestScenarioResponse`.

### DELETE /api/scenarios/{id}
Delete a scenario and enforce referential cascade checks.
- **Response 200 OK**: `{ "status": "deleted", "id": 1 }`.

---

## 3. Test Runs & Execution Events (`/api/runs`)

### GET /api/runs
List test runs with pagination and status filtering.
- **Query Params**:
  - `status` (optional, string): Filter by `pending`, `running`, `completed`, `failed`.
  - `scenario_id` (optional, int): Filter runs for a specific scenario.
  - `limit` (int, default 50): Page limit.
  - `offset` (int, default 0): Offset.
- **Response 200 OK**: Array of `TestRunResponse` objects.

### POST /api/runs
Create a new test run. Automatically creates initial execution events and generates an associated test report.
- **Request Body**:
  ```json
  {
    "run_code": "RUN-0025",
    "scenario_id": 1,
    "status": "completed",
    "risk_score": 78,
    "verdict": "failed",
    "target_system": "E-Commerce CRM",
    "environment": "sandbox-isolated",
    "duration_seconds": 84
  }
  ```
- **Response 201 Created**: Created `TestRunResponse`.

### GET /api/runs/{id}
Retrieve test run details including relationships.
- **Response 200 OK**: `TestRunResponse`.

### PUT /api/runs/{id}
Update status, verdict, or risk score of an active run.
- **Response 200 OK**: Updated `TestRunResponse`.

### DELETE /api/runs/{id}
Delete a test run. Cascades to execution events and reports.
- **Response 200 OK**: `{ "status": "deleted", "id": 1 }`.

### GET /api/runs/{id}/events
Retrieve chronological execution events for a test run.
- **Response 200 OK**: Array of `ExecutionEventResponse` objects sorted by `sequence_number` ascending.

### POST /api/runs/{id}/events
Append a new execution event to a test run.
- **Request Body**:
  ```json
  {
    "event_type": "action",
    "action_name": "Process refund",
    "status": "passed",
    "sequence_number": 5,
    "details": "Refund processed within authorized limits."
  }
  ```
- **Response 201 Created**: `ExecutionEventResponse`.

---

## 4. Reports & Forensic Exports (`/api/reports`)

### GET /api/reports
List all test reports with optional verdict filtering.
- **Response 200 OK**: Array of `TestReportResponse` objects.

### GET /api/reports/{id}
Retrieve report by ID.
- **Response 200 OK**: `TestReportResponse`.

### DELETE /api/reports/{id}
Delete a test report.
- **Response 200 OK**: `{ "status": "deleted", "id": 1 }`.

### GET /api/reports/{id}/export?format={json|csv}
Export forensic report data.
- **format=json**: Content-Disposition attachment download as `report_{id}_{run_code}.json`.
- **format=csv**: Content-Disposition CSV tabular export as `report_{id}_{run_code}.csv` with columns: `Report ID`, `Run Code`, `Verdict`, `Risk Score`, `Critical Findings`, `Total Actions`, `Passed Actions`, `Failed Actions`, `Summary`.

---

## 5. Application Settings (`/api/settings`)

### GET /api/settings
Retrieve all application settings. Values marked `is_secret=true` are automatically masked.
- **Response 200 OK**: Array of `ApplicationSettingResponse` objects.

### POST /api/settings
Create or register a setting.
- **Request Body**:
  ```json
  {
    "key": "execution.timeout_seconds",
    "value": "120",
    "description": "Timeout threshold for sandbox runs",
    "is_secret": false
  }
  ```
- **Response 201 Created**: `ApplicationSettingResponse`.

### PUT /api/settings/{key}
Update an existing setting value.
- **Response 200 OK**: Updated `ApplicationSettingResponse`.

### DELETE /api/settings/{key}
Remove a setting key.
- **Response 200 OK**: `{ "status": "deleted", "key": "execution.timeout_seconds" }`.

---

## 6. Local SQLite Backup & Recovery (`/api/backup`)

### GET /api/backup/status
Query SQLite database file path, size, WAL mode, counts for all 5 models, and last modified timestamp.
- **Response 200 OK**: `BackupStatusResponse`.

### GET /api/backup/export
Downloads a snapshot copy of `agent_crash_test.db` with Content-Disposition `attachment; filename=agent_crash_test_backup_<timestamp>.db`. Uses SQLite VACUUM INTO / safe file snapshot.

### POST /api/backup/restore
Restore database from a binary SQLite file.
- **Security Guard**: Requires multipart form field `confirmation="CONFIRM"`.
- Creates an automatic pre-restore backup (`.pre_restore_bak`) before atomic replacement.
- **Response 200 OK**: `{ "status": "restored", "message": "Database restored successfully", "size_bytes": 126976 }`.

### POST /api/database/seed
Re-populates default foundation scenarios and settings if missing.
- **Response 200 OK**: `{ "status": "seeded", "message": "Database seeded with baseline data" }`.
