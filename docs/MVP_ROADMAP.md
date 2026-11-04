# Agent Crash Test — MVP Development Roadmap

This roadmap defines the six planned phases of Agent Crash Test.  
**Phase 1 Foundation is currently implemented. Phases 2 through 6 are strictly deferred.**

---

## Phase 1: Foundation (CURRENT — IMPLEMENTED)
- [x] Establish monorepo structure, configuration, and documentation.
- [x] Implement Cyber Operations Center frontend application shell.
- [x] Implement FastAPI backend with `/api/health`, `/api/ready`, `/api/version`.
- [x] Configure PostgreSQL 16 database connection pooling and Alembic migration system.
- [x] Configure Docker Compose multi-service local environment.
- [x] Create automated unit tests for frontend and backend.
- [x] Validate zero mock database substitutions; establish real readiness check.

---

## Phase 2: Mock Business Environment (PLANNED)
- [ ] Implement simulated E-commerce CRM backend service.
- [ ] Create mock database models: Orders, Line Items, Customers, Refund Requests, Shipping Status.
- [ ] Provide web-based CRM operator interface with orders table and customer profile views.
- [ ] Implement REST APIs for order status lookup, refund authorization, and supervisor escalation.
- [ ] Add pre-configured business rules (e.g., maximum refund $50 without receipt, 30-day return window).

---

## Phase 3: AI Business Agent (PLANNED)
- [ ] Integrate Vultr Serverless Inference API client.
- [ ] Implement autonomous agent prompt loop with tool schema definitions.
- [ ] Enable agent tools: `search_orders()`, `get_customer_history()`, `issue_refund()`, `request_escalation()`.
- [ ] Support system prompt parameterization and model temperature controls.

---

## Phase 4: Crash Scenarios (PLANNED)
- [ ] Design adversarial prompt injection attack library (jailbreaks, directive overrides).
- [ ] Design unauthorized entity attack scenarios (wrong customer requesting another user's refund).
- [ ] Design duplicate refund attack scenarios (concurrency race and idempotency bypass).
- [ ] Design downstream dependency failure scenarios (payment gateway 500 error, network timeout).
- [ ] Design policy boundary violations (exceeding refund limit, expired return window).

---

## Phase 5: Sandbox and Evidence (PLANNED)
- [ ] Build isolated container runner spawning sandboxed worker instances per test run.
- [ ] Integrate Playwright headless browser automation driving the CRM interface.
- [ ] Implement forensic evidence recorder: DOM actions, screenshot captures, network requests, agent thought traces.
- [ ] Build deterministic evaluation engine comparing agent output against ground truth security rules.
- [ ] Generate comprehensive forensic test run reports.

---

## Phase 6: Deployment and Demo (PLANNED)
- [ ] Provision production Vultr Cloud Compute virtual machine instance.
- [ ] Configure production Nginx reverse proxy with TLS certificate provisioning.
- [ ] Automate continuous deployment pipeline.
- [ ] Create interactive live demonstration walkthrough with benchmark test suite.
