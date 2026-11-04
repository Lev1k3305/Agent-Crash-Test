# Agent Crash Test — Local-First Data Model & Schema Specification

## 1. Database Architecture
- **Engine**: SQLite 3 (Local-First Persistent Storage)
- **Database File**: `data/agent_crash_test.db` (absolute path derived from backend project root)
- **Concurrency & Integrity**:
  - `PRAGMA foreign_keys = ON;` (Strict referential integrity)
  - `PRAGMA busy_timeout = 5000;` (Handles concurrent database access)
  - `PRAGMA journal_mode = WAL;` (Write-Ahead Logging for high performance concurrent reads and writes)
- **Migration Manager**: Alembic (Migrations `0001_initial_foundation` and `0002_local_first_persistence`)
- **ORM**: SQLAlchemy 2.x Declarative Base

---

## 2. Persistent Database Models (Implemented)

### A. Table: `test_scenarios`
Stores stress-testing and adversarial scenario definitions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Index | Sequential scenario ID |
| `code` | String(32) | Unique, Index, Not Null | Unique identifier (e.g. `SEC-01`, `BUS-01`) |
| `name` | String(128) | Not Null | Scenario display name |
| `category` | String(64) | Index, Not Null | `Security`, `Business`, `Reliability` |
| `risk_level` | String(32) | Not Null | `Critical`, `High`, `Medium`, `Low` |
| `description` | Text | Not Null | High-level scenario explanation |
| `detailed_threat`| Text | Nullable | Specific exploit or attack payload details |
| `target_workflow`| String(128)| Nullable | Business system workflow (e.g. `E-commerce CRM`) |
| `is_active` | Boolean | Default True | Scenario active status |
| `created_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Last updated timestamp |

*Relationship*: `runs` -> One-to-many relationship with `test_runs` (`cascade="all, delete-orphan"`).

---

### B. Table: `test_runs`
Records test executions linked to scenarios.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Index | Sequential run ID |
| `run_number` | String(64) | Unique, Index, Not Null | Human-readable ID (e.g. `RUN-0024`) |
| `scenario_id` | Integer | Foreign Key (`test_scenarios.id`), Index | Targeted scenario ID |
| `status` | String(32) | Index, Not Null | `PENDING`, `RUNNING`, `COMPLETED`, `FAILED` |
| `result` | String(32) | Index, Not Null | `PASSED`, `FAILED`, `INCONCLUSIVE` |
| `risk_score` | Integer | Default 0, Not Null | Calculated score (0–100) |
| `duration_seconds`| Float | Default 0.0, Not Null | Run elapsed time in seconds |
| `target_system` | String(128)| Default `E-commerce CRM` | Target test system |
| `notes` | Text | Nullable | Execution observations |
| `created_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Execution start timestamp |
| `updated_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Record update timestamp |

*Relationships*:
- `scenario` -> Many-to-one relationship with `test_scenarios`.
- `events` -> One-to-many relationship with `execution_events` (`cascade="all, delete-orphan"`).
- `report` -> One-to-one relationship with `test_reports` (`cascade="all, delete-orphan"`).

---

### C. Table: `execution_events`
Stores ordered forensic telemetry events recorded during a test run.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Index | Sequential event ID |
| `run_id` | Integer | Foreign Key (`test_runs.id`), Index | Parent test run ID |
| `sequence_number`| Integer | Index, Not Null | Chronological order sequence number |
| `timestamp` | DateTime | Server default `CURRENT_TIMESTAMP` | Event timestamp |
| `event_type` | String(64) | Not Null | `NAVIGATION`, `ACTION`, `VERIFICATION`, `SECURITY_ALERT` |
| `message` | String(256)| Not Null | Human-readable telemetry log message |
| `details` | Text | Nullable | JSON payload or technical trace |
| `status` | String(32) | Default `SUCCESS` | `SUCCESS`, `WARNING`, `FAILURE`, `PENDING` |

---

### D. Table: `test_reports`
Stores deterministic forensic reports generated from test executions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Index | Report sequential ID |
| `run_id` | Integer | Foreign Key (`test_runs.id`), Unique, Index | Associated run ID (1-to-1) |
| `summary` | Text | Not Null | Evaluation summary text |
| `result` | String(32) | Not Null | `PASSED`, `FAILED`, `CRITICAL_FAILURE` |
| `risk_score` | Integer | Default 0, Not Null | Evaluated risk score |
| `findings_count`| Integer | Default 0, Not Null | Number of policy/security findings |
| `findings_summary`| Text | Nullable | Summary of violations |
| `evidence_summary`| Text | Nullable | Evidence artifacts description |
| `created_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Generation timestamp |
| `updated_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Update timestamp |

---

### E. Table: `application_settings`
Stores persistent platform configuration in SQLite.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Index | Setting sequential ID |
| `key` | String(128)| Unique, Index, Not Null | Configuration key identifier |
| `value` | Text | Not Null | Configuration value |
| `description` | String(256)| Nullable | Setting explanation |
| `is_secret` | Boolean | Default False, Not Null | Whether value is masked in UI |
| `created_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | DateTime | Server default `CURRENT_TIMESTAMP` | Update timestamp |

---

## 3. Backup & Persistence Guarantees
- **Location**: Database file lives in `<workspace>/data/agent_crash_test.db`.
- **Survives**: Browser refresh, server process restarts, computer restarts.
- **Export**: Can be downloaded as a binary SQLite copy via `GET /api/backup/export`.
- **Restore**: Point-in-time restore supported via `POST /api/backup/restore` with mandatory `CONFIRM` safety flag and pre-restore rollback snapshot.
