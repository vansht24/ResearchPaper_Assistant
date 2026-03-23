from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"

    # Directories
    data_dir: str = "./data"
    raw_pdf_dir: str = "./data/raw_pdfs"
    processed_dir: str = "./data/processed"
    vector_db_dir: str = "./data/vector_db"

    # CORS — kept as plain string to avoid JSON parsing issues
    allowed_origins: str = "http://localhost:3000"

    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/app.log"

    # Embeddings
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 50

    # Ollama
    ollama_model: str = "mistral"
    ollama_base_url: str = "http://localhost:11434"
    top_k_results: int = 3

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    def create_directories(self):
        for d in [self.data_dir, self.raw_pdf_dir, self.processed_dir, self.vector_db_dir]:
            Path(d).mkdir(parents=True, exist_ok=True)
        Path(self.log_file).parent.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.create_directories()