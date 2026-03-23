"""
Embedding model manager using sentence-transformers
Filename: embedding_manager.py  (matches your project structure)
"""

from sentence_transformers import SentenceTransformer
from typing import List
from src.utils.logger import setup_logger
from src.config.settings import settings

logger = setup_logger(__name__)


class EmbeddingManager:
    """Wrapper around a sentence-transformers model."""

    def __init__(self, model_name: str = None):
        name = model_name or settings.embedding_model
        logger.info(f"Loading embedding model: {name}")
        self.model = SentenceTransformer(name)
        self.model_name = name
        logger.info("Embedding model loaded successfully")

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document chunks."""
        try:
            embeddings = self.model.encode(texts, show_progress_bar=False)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise

    def embed_query(self, query: str) -> List[float]:
        """Embed a single query string."""
        try:
            embedding = self.model.encode([query], show_progress_bar=False)[0]
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error embedding query: {e}")
            raise


# ── Singleton ─────────────────────────────────────────────────────────────────
_embedding_manager: EmbeddingManager | None = None


def get_embedding_manager() -> EmbeddingManager:
    global _embedding_manager
    if _embedding_manager is None:
        _embedding_manager = EmbeddingManager()
    return _embedding_manager