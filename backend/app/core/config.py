from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Voice Latency Studio API"
    DEEPGRAM_API_KEY: str = os.environ.get("DEEPGRAM_API_KEY", "dummy-deepgram")
    OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "dummy-openai")

settings = Settings()
