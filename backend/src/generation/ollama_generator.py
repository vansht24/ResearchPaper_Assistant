"""
Ollama LLM integration for answer generation
"""

import ollama
from typing import List, Dict
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class OllamaGenerator:
    """
    Ollama-based answer generator
    """
    
    def __init__(self, model_name: str = "llama3.2:1b"):
        """
        Initialize Ollama generator
        
        Args:
            model_name: Ollama model name (default: mistral)
        """
        self.model_name = model_name
        logger.info(f"Initialized Ollama generator with model: {model_name}")
    
    def generate_answer(
        self,
        query: str,
        context_chunks: List[str],
        max_tokens: int = 500
    ) -> str:
        """
        Generate an answer using retrieved context
        
        Args:
            query: User's question
            context_chunks: Retrieved document chunks
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated answer
        """
        try:
            # Build context from chunks
            context = "\n\n".join([
                f"[Chunk {i+1}]\n{chunk}"
                for i, chunk in enumerate(context_chunks)
            ])
            
            # Create prompt
            prompt = f"""You are a helpful research assistant. Answer the question based on the provided context from research papers.

Context:
{context}

Question: {query}

Answer the question based only on the information provided in the context above. If the context doesn't contain enough information to answer the question, say so. Be concise and accurate.

Answer:"""
            
            logger.info(f"Generating answer for query: {query[:50]}...")
            
            # Call Ollama
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "num_predict": max_tokens,
                    "temperature": 0.7
                }
            )
            
            answer = response["response"].strip()
            logger.info("Answer generated successfully")
            
            return answer
        
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            raise Exception(f"Failed to generate answer: {str(e)}")


# Global instance
_generator = None


def get_generator() -> OllamaGenerator:
    """
    Get or create the global generator instance
    """
    global _generator
    
    if _generator is None:
        _generator = OllamaGenerator()
    
    return _generator