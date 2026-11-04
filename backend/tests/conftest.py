import os
import sys
import pytest

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.config import settings


@pytest.fixture
def mock_db_connected(monkeypatch):
    """Fixture to mock successful database connectivity."""
    from backend.app.services import health
    monkeypatch.setattr(health, "check_db_connectivity", lambda: True)


@pytest.fixture
def mock_db_disconnected(monkeypatch):
    """Fixture to mock failed database connectivity."""
    from backend.app.services import health
    monkeypatch.setattr(health, "check_db_connectivity", lambda: False)
