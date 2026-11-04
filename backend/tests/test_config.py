import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.config import Settings


class TestConfig(unittest.TestCase):
    def test_default_config_values(self):
        cfg = Settings(
            APP_NAME="Agent Crash Test",
            APP_VERSION="1.0.0",
            API_VERSION="v1",
            APP_ENV="development",
            CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
        )
        self.assertEqual(cfg.APP_NAME, "Agent Crash Test")
        self.assertEqual(cfg.APP_VERSION, "1.0.0")
        self.assertEqual(cfg.API_VERSION, "v1")
        self.assertFalse(cfg.is_production)
        self.assertEqual(cfg.cors_origins_list, ["http://localhost:3000", "http://127.0.0.1:3000"])

    def test_cors_origins_parsing(self):
        cfg = Settings(CORS_ORIGINS="https://crash.internal.net, https://preview.domain.com")
        self.assertEqual(cfg.cors_origins_list, ["https://crash.internal.net", "https://preview.domain.com"])

    def test_production_flag(self):
        cfg = Settings(APP_ENV="production")
        self.assertTrue(cfg.is_production)


if __name__ == "__main__":
    unittest.main()
