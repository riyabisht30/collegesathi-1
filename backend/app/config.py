from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database (defaults to SQLite for easy demo - switch to PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./faraway.db"
    
    # Auth
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # SMTP (for admin OTP emails)
    SMTP_EMAIL: str = "ishumehra1534@gmail.com"
    SMTP_PASSWORD: str = ""  # Gmail App Password - set in .env
    
    # App
    APP_NAME: str = "CollegeSathi"
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"


settings = Settings()
