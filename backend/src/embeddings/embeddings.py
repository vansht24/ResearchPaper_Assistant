"""
Text embedding generation using sentence-transformers
"""

from sentence_transformers import SentenceTransformer
from typing import List
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class EmbeddingModel:
    """
    Wrapper for sentence-transformers embedding model
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the embedding model
        
        Args:
            model_name: HuggingFace model name (default: all-MiniLM-L6-v2)
        """
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        logger.info("Embedding model loaded successfully")
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors
        """
        try:
            embeddings = self.model.encode(texts, show_progress_bar=False)
            return embeddings.tolist()
        
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
    
    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a single query
        
        Args:
            query: Query string
            
        Returns:
            Embedding vector
        """
        try:
            embedding = self.model.encode([query], show_progress_bar=False)[0]
            return embedding.tolist()
        
        except Exception as e:
            logger.error(f"Error embedding query: {e}")
            raise


# Global instance
_embedding_model = None


def get_embedding_model() -> EmbeddingModel:
    """
    Get or create the global embedding model instance
    """
    global _embedding_model
    
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
    
    return _embedding_model