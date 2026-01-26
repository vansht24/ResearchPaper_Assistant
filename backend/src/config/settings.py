from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    host: str
    port: int
    environment: str

    data_dir: str
    raw_pdf_dir: str
    processed_dir: str

    allowed_origins: List[str]

    log_level: str
    log_file: str

    class Config:
        env_file = ".env"
        env_parse_delimiter = ","

    def create_directories(self):
        Path(self.data_dir).mkdir(parents=True, exist_ok=True)
        Path(self.raw_pdf_dir).mkdir(parents=True, exist_ok=True)
        Path(self.processed_dir).mkdir(parents=True, exist_ok=True)


settings = Settings()
