# Agent Crash Test — Security Model

## 1. Security Philosophy
Agent Crash Test is an adversarial testing platform designed to evaluate AI agents under hostile conditions. Because future versions will execute untrusted agent code and inject malicious prompts, the platform's foundation enforces strict security controls from the outset.

---

## 2. Implemented Baseline Security Controls (Phase 1)

### A. Secret Management & Repository Hygiene
- **No Hardcoded Secrets**: Zero credentials, database passwords, or API keys are committed to the codebase.
- **Template Configuration**: `.env.example` provides non-sensitive defaults and placeholders only.
- **Aggressive Git Hygiene**: `.gitignore` blocks `.env*`, database volumes (`pgdata/`), compiled bytecode, and logs.

### B. Network & API Protection
- **Explicit CORS Control**: Backend API restricts Allowed Origins using configurable whitelists (`CORS_ORIGINS`). Wildcard origins (`*`) are disallowed in production mode.
- **Sanitized Error Responses**: API error handlers catch unhandled exceptions and return generic error summaries, preventing stack traces or database connection strings from being exposed to clients.
- **Credential Masking in Logging**: Custom logging formatter scans log entries and strips database passwords and authorization headers prior to terminal emission.

### C. Container & Infrastructure Security
- **Non-Root Execution**: Backend Docker container runs under dedicated unprivileged system user (`appuser:appgroup` UID 10001).
- **No Privileged Mode**: Containers do not run in privileged mode.
- **No Docker Socket Mounting**: The host Docker socket (`/var/run/docker.sock`) is never mounted into application containers.
- **Health Checks & Resource Isolation**: Standard container health checks prevent traffic routing to unready services.

---

## 3. Known Limitations (Phase 1)
- Authentication & Authorization: Phase 1 provides public foundation endpoints (`/api/health`, `/api/ready`, `/api/version`) without user login or role-based access control (RBAC).
- Database Encryption at Rest: Default Docker Compose uses local volume storage without host-level volume encryption.

---

## 4. Deferred Security Features (Phases 2-6)
- **Isolated Sandbox Cages**: Multi-tenant container isolation, seccomp profiles, and network egress firewalls will be introduced in Phase 5.
- **User Authentication**: JWT / OAuth2 authentication for dashboard operators.
- **Audit Logging**: Immutable hash-chained audit logs for security findings.
