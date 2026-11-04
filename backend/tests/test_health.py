import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.services.health import HealthService
from backend.app.schemas.health import HealthResponse


class TestHealthEndpoint(unittest.TestCase):
    def test_health_service_returns_ok(self):
        result = HealthService.get_health()
        self.assertIsInstance(result, HealthResponse)
        self.assertEqual(result.status, "ok")
        self.assertEqual(result.service, "agent-crash-test-api")


if __name__ == "__main__":
    unittest.main()
