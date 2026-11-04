import unittest
from unittest.mock import patch
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.services.health import HealthService
from backend.app.schemas.health import ReadyResponse


class TestReadyEndpoint(unittest.TestCase):
    @patch("backend.app.services.health.check_db_connectivity", return_value=True)
    def test_ready_when_database_connected(self, mock_check):
        response, status_code = HealthService.get_readiness()
        self.assertEqual(status_code, 200)
        self.assertIsInstance(response, ReadyResponse)
        self.assertEqual(response.status, "ready")
        self.assertEqual(response.database, "connected")
        self.assertIsNone(response.error)

    @patch("backend.app.services.health.check_db_connectivity", return_value=False)
    def test_ready_when_database_disconnected(self, mock_check):
        response, status_code = HealthService.get_readiness()
        self.assertEqual(status_code, 503)
        self.assertIsInstance(response, ReadyResponse)
        self.assertEqual(response.status, "degraded")
        self.assertEqual(response.database, "disconnected")
        self.assertIn("Database connection failed", response.error)
        # Ensure no passwords or urls are leaked in error
        self.assertNotIn("postgres", response.error.lower())
        self.assertNotIn("password", response.error.lower())


if __name__ == "__main__":
    unittest.main()
