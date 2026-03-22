"""
Vector database for storing and retrieving document chunks
"""

import chromadb
from chromadb.config import Settings
from typing import List, Dict
from pathlib import Path
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class VectorStore:
    """
    ChromaDB vector store for document retrieval
    """
    
    def __init__(self, persist_directory: str = "./data/chroma_db"):
        """
        Initialize ChromaDB client
        """
        logger.info(f"Initializing ChromaDB at {persist_directory}")
        
        # Create directory if it doesn't exist
        Path(persist_directory).mkdir(parents=True, exist_ok=True)
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="research_papers",
            metadata={"description": "Research paper chunks with embeddings"}
        )
        
        logger.info("ChromaDB initialized successfully")
    
    def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict],
        ids: List[str]
    ):
        """
        Add documents to the vector store
        """
        try:
            self.collection.add(
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Added {len(texts)} documents to vector store")
        
        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            raise
    
    def query(
        self,
        query_embedding: List[float],
        top_k: int = 5
    ) -> Dict:
        """
        Query the vector store
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of results to return
            
        Returns:
            Dictionary with documents, distances, and metadata
        """
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            
            return {
                "documents": results["documents"][0],
                "distances": results["distances"][0],
                "metadatas": results["metadatas"][0]
            }
        
        except Exception as e:
            logger.error(f"Error querying vector store: {e}")
            raise
    
    def delete_by_filename(self, filename: str):
        """
        Delete all chunks from a specific file
        """
        try:
            # Query all documents with this filename
            results = self.collection.get(
                where={"filename": filename}
            )
            
            if results["ids"]:
                self.collection.delete(ids=results["ids"])
                logger.info(f"Deleted {len(results['ids'])} chunks from {filename}")
        
        except Exception as e:
            logger.error(f"Error deleting documents: {e}")
            raise
    
    def count(self) -> int:
        """
        Get total number of documents in the store
        """
        return self.collection.count()


# Global instance
_vector_store = None


def get_vector_store() -> VectorStore:
    """
    Get or create the global vector store instance
    """
    global _vector_store
    
    if _vector_store is None:
        _vector_store = VectorStore()
    
    return _vector_store