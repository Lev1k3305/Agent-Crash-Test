# Agent Crash Test — Threat Model

## 1. Scope & System Assets
This threat model analyzes threats against the Agent Crash Test platform foundation and establishes threat assumptions for future adversarial testing phases.

### Primary Assets
1. **Target CRM & Database**: Sensitive enterprise business data, customer orders, and financial records.
2. **Platform Infrastructure**: Host VM, Docker daemon, backend API, and database containers.
3. **Forensic Evidence & Findings**: Integrity of test audit trails, screenshots, and security scoring.

---

## 2. Threat Actors & Vectors

### A. Adversarial External User / Attacker
- **Vector**: Direct input into AI agent chat interfaces or customer order forms.
- **Goal**: Trick the AI agent into issuing unauthorized refunds, leaking other customers' private data, or running unverified tools.
- **Platform Countermeasure (Planned Phase 4-5)**: Platform tests and catalogs these vectors to help developers harden their agents.

### B. Rogue or Compromised AI Agent
- **Vector**: Untrusted LLM output invoking malicious tool arguments, SQL injections, or SSRF attacks against internal network endpoints.
- **Platform Countermeasure (Phase 1 Baseline + Phase 5)**:
  - Database queries from backend use parameterized SQLAlchemy ORM.
  - Planned Phase 5: Container sandbox isolates network egress and prevents access to host network.

### C. Direct API Abuse against Platform
- **Vector**: Denial of Service or probing of `/api/ready` and backend endpoints.
- **Platform Countermeasure (Phase 1 Implemented)**:
  - Connection pooling limits database exhaustion.
  - Short database ping timeout (3s) prevents endpoint hanging.
  - Sanitized 503 response prevents credential leakage during database degradation.

---

## 3. STRIDE Threat Matrix (Phase 1 Evaluation)

| Category | Threat | Status | Implemented Mitigation |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Forging backend status responses | Mitigated | Typed Pydantic schemas and strict HTTP error codes |
| **Tampering** | Modifying database records via injection | Mitigated | Parameterized queries via SQLAlchemy ORM |
| **Repudiation** | Denying system status changes | Deferred | Audit logging deferred to Phase 5 |
| **Information Disclosure** | Exposing database password in logs or errors | Mitigated | SafeFormatter regex masking; sanitized 503 errors |
| **Denial of Service** | Exhausting DB connections via health polling | Mitigated | Pool pre-ping and lightweight `SELECT 1` queries |
| **Elevation of Privilege** | Container escape to host system | Mitigated | Non-root container user (`appuser`); no socket mounts |
