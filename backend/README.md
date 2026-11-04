# Agent Crash Test Backend API

Backend service for Agent Crash Test — AI Agent Reliability & Security Testing Platform.

## Overview
- **Framework**: FastAPI
- **Database**: Local SQLite 3 with WAL journal mode
- **ORM & Migrations**: SQLAlchemy 2.x & Alembic
- **Package Management**: Setuptools / uv

## Structure
- `app/`: FastAPI application code (routes, db, models, schemas, services, core)
- `tests/`: Automated unit and persistence tests
- `alembic/`: Database migrations
