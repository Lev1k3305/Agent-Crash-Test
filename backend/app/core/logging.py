import logging
import re
import sys
from backend.app.core.config import settings

# Pattern to mask sensitive connection strings in logs
SENSITIVE_PATTERN = re.compile(r"://([^:]+):([^@]+)@")


class SafeFormatter(logging.Formatter):
    """Custom logging formatter that strips database credentials and tokens."""
    def format(self, record: logging.LogRecord) -> str:
        msg = super().format(record)
        return SENSITIVE_PATTERN.sub(r"://\1:***@", msg)


def setup_logging():
    """Configure application-wide safe logging."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger = logging.getLogger("agent_crash_test")
    logger.setLevel(log_level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        formatter = SafeFormatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logging()
