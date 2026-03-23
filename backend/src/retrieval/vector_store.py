"""
ChromaDB vector store wrapper
"""

import chromadb
from typing import List, Dict
from pathlib import Path
from src.utils.logger import setup_logger
from src.config.settings import settings

logger = setup_logger(__name__)


class VectorStore:
    """Persistent ChromaDB collection for document chunk embeddings."""

    def __init__(self, persist_directory: str = None):
        directory = persist_directory or settings.vector_db_dir
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"Initialising ChromaDB at: {directory}")

        self.client = chromadb.PersistentClient(path=directory)
        self.collection = self.client.get_or_create_collection(
            name="research_papers",
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            f"ChromaDB ready — collection has {self.collection.count()} chunks"
        )

    # ── Write ─────────────────────────────────────────────────────────────────

    def add_documents(
        self,
        texts:      List[str],
        embeddings: List[List[float]],
        metadatas:  List[Dict],
        ids:        List[str],
    ) -> None:
        try:
            self.collection.add(
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            logger.info(f"Stored {len(texts)} chunks in vector store")
        except Exception as e:
            logger.error(f"Error storing chunks: {e}")
            raise

    def delete_by_filename(self, filename: str) -> None:
        try:
            result = self.collection.get(where={"filename": filename})
            if result["ids"]:
                self.collection.delete(ids=result["ids"])
                logger.info(
                    f"Deleted {len(result['ids'])} chunks for '{filename}'"
                )
            else:
                logger.warning(f"No chunks found for '{filename}' — nothing deleted")
        except Exception as e:
            logger.error(f"Error deleting chunks: {e}")
            raise

    # ── Read ──────────────────────────────────────────────────────────────────

    def query(
        self,
        query_embedding: List[float],
        top_k: int = None,
    ) -> Dict:
        k = top_k or settings.top_k_results
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(k, self.collection.count()),
            )
            return {
                "documents": results["documents"][0],
                "distances": results["distances"][0],
                "metadatas": results["metadatas"][0],
            }
        except Exception as e:
            logger.error(f"Error querying vector store: {e}")
            raise

    def count(self) -> int:
        return self.collection.count()


# ── Singleton ─────────────────────────────────────────────────────────────────
_vector_store: VectorStore | None = None


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store