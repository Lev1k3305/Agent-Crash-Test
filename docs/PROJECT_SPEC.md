# Agent Crash Test — Product Specification

## 1. Product Overview
**Product Name**: Agent Crash Test  
**Category**: AI Agent Reliability & Security Testing Platform  
**Target Milestone**: Phase 1 — Foundation

### Vision & Core Principle
> **"Evaluate what an AI agent actually does, not only what it says."**

Enterprises are rapidly deploying autonomous AI agents to execute high-impact business workflows—such as e-commerce order management, refunds, billing adjustments, and inventory allocations. While traditional LLM benchmarks test conversational quality or static QA datasets, they fail to evaluate agent behavior when interacting with business APIs, databases, and adversarial users.

Agent Crash Test stress-tests business-facing AI agents within controlled, isolated execution environments. The platform exposes agents to real-world edge cases, policy violations, API faults, and prompt injection attacks, measuring deterministic outcomes and capturing complete forensic evidence.

---

## 2. Target Users & Stakeholders
1. **AI & ML Engineers**: Validating agent system prompts, tool schemas, and guardrail resilience before production deployment.
2. **Enterprise Security & Red Teams**: Auditing autonomous agents for prompt injection vulnerabilities, unauthorized data exfiltration, and tool abuse.
3. **Product & Operations Managers**: Ensuring business policies (e.g., maximum refund thresholds, return windows, customer authorization) are strictly enforced by AI workers.

---

## 3. Initial Business Use Case
The primary operational domain is **E-commerce Order & Refund Processing**:
- Customer requests a refund for damaged/lost/late goods.
- Agent interacts with customer CRM, order history, tracking APIs, and payment gateways.
- Agent decides whether to issue refund, deny refund, request photos, or escalate to human supervisor.

---

## 4. Phase 1 Foundation Scope & Boundaries

### Included in Phase 1 Foundation
- Monorepo structure with frontend, backend, docker infrastructure, and comprehensive technical documentation.
- Cyber Operations Center frontend interface with real backend API connectivity status.
- FastAPI backend implementing process health (`/api/health`), PostgreSQL database readiness verification (`/api/ready`), and application version metadata (`/api/version`).
- Database abstraction with SQLAlchemy 2.x, PostgreSQL 16 schema migrations via Alembic, and safe error handling without secret disclosure.
- Docker Compose multi-service architecture for local development (Frontend, Backend, PostgreSQL).
- Automated test suites for frontend and backend with zero test failures.

### Strictly Excluded (Deferred to Later Phases)
- **No AI Agent or LLM Integration**: No Vultr Serverless Inference, OpenAI, Anthropic, or Gemini agent invocations.
- **No Sandbox Execution Engine**: No container spawning or dynamic execution runners.
- **No Playwright Automation**: No browser drivers or synthetic CRM UI interactions.
- **No Business Logic Mock Engine**: No actual order/refund state machines or CRM database seeds.
- **No Attack Scenario Execution**: Scenarios are displayed as informational previews only.
- **No Evaluator or Evidence Harvester**: No log harvesters or report generators.
- **No Multi-tenancy or Paid Cloud VM provisioning**.

---

## 5. Acceptance Criteria
- [x] Monorepo structure is cleanly established and exportable.
- [x] Frontend starts and runs on port 3000.
- [x] Backend starts and exposes `/api/health`, `/api/ready`, `/api/version`.
- [x] `/api/ready` validates PostgreSQL database connectivity and safely reports degraded status on disconnection.
- [x] Frontend communicates with backend health and readiness endpoints in real time.
- [x] Docker Compose validates and defines multi-container architecture.
- [x] All automated test checks pass without errors.
- [x] Comprehensive documentation set matches codebase.
