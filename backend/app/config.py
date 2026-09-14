import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Stock Market Analysis & Prediction System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "stock_market_super_secret_jwt_key_2026_antigravity")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (Default SQLite for zero-config local development, PostgreSQL compatible)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stock_app.db")
    
    # Optional News API Key (Clean fallback to yfinance / free RSS if empty)
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
