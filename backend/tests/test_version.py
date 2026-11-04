import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.services.health import HealthService
from backend.app.schemas.version import VersionResponse


class TestVersionEndpoint(unittest.TestCase):
    def test_version_returns_metadata(self):
        result = HealthService.get_version()
        self.assertIsInstance(result, VersionResponse)
        self.assertEqual(result.name, "Agent Crash Test")
        self.assertEqual(result.app_version, "1.0.0")
        self.assertEqual(result.api_version, "v1")


if __name__ == "__main__":
    unittest.main()
