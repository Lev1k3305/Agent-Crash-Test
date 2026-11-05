import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

# Derive absolute project root and data directory
# backend/app/core/config.py -> core -> app -> backend -> PROJECT_ROOT
CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parent.parent.parent.parent
DEFAULT_DATA_DIR = PROJECT_ROOT / "data"


class Settings(BaseSettings):
    """Application configuration validated with environment variables."""
    APP_NAME: str = Field(default="Agent Crash Test")
    APP_VERSION: str = Field(default="1.0.0")
    API_VERSION: str = Field(default="v1")
    APP_ENV: str = Field(default=os.getenv("APP_ENV", "development"))
    LOG_LEVEL: str = Field(default=os.getenv("LOG_LEVEL", "INFO"))
    
    # Absolute data directory configuration
    DATA_DIR: Path = Field(
        default=Path(os.getenv("DATA_DIR", str(DEFAULT_DATA_DIR)))
    )

    # SQLite Database Configuration (Local-first, persistent)
    DATABASE_URL: str = Field(default="")

    # Explicit CORS configuration (includes Vite dev defaults on 5173 and 3000)
    CORS_ORIGINS: str = Field(
        default=os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
        )
    )

    def model_post_init(self, __context) -> None:
        # Ensure data directory exists
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not self.DATABASE_URL:
            db_path = self.DATA_DIR / "agent_crash_test.db"
            self.DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def db_file_path(self) -> Path:
        """Return the absolute path to the SQLite database file if using SQLite."""
        if self.DATABASE_URL.startswith("sqlite:///"):
            clean_path = self.DATABASE_URL.replace("sqlite:///", "")
            return Path(clean_path).resolve()
        return self.DATA_DIR / "agent_crash_test.db"


settings = Settings()
