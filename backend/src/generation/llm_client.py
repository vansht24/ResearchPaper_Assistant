"""
Ollama LLM client for answer generation
Filename: llm_client.py  (matches your project structure)
Compatible with ollama==0.3.3
"""

import ollama
from typing import List
from src.utils.logger import setup_logger
from src.config.settings import settings

logger = setup_logger(__name__)


class LLMClient:
    """Ollama-backed LLM client."""

    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.ollama_model
        self.client = ollama.Client(host=settings.ollama_base_url)
        logger.info(
            f"LLM client ready — model: {self.model_name} | "
            f"url: {settings.ollama_base_url}"
        )

    def generate_answer(
        self,
        query: str,
        context_chunks: List[str],
        max_tokens: int = 500,
    ) -> str:
        """
        Build a RAG prompt from the retrieved chunks and call Ollama.

        Args:
            query:          The user's question.
            context_chunks: Top-k document chunks from the vector store.
            max_tokens:     Max tokens for the generated response.

        Returns:
            The generated answer as a plain string.
        """
        context = "\n\n".join(
            f"[Chunk {i + 1}]\n{chunk}" for i, chunk in enumerate(context_chunks)
        )

        prompt = f"""You are a helpful research assistant. Answer the question based only on the provided context from research papers.

Context:
{context}

Question: {query}

Instructions:
- Answer using only the information in the context above.
- If the context does not contain enough information, say so clearly.
- Be concise and accurate.

Answer:"""

        logger.info(f"Generating answer for: {query[:60]}…")

        try:
            response = self.client.generate(
                model=self.model_name,
                prompt=prompt,
                options={"num_predict": max_tokens, "temperature": 0.7},
            )
            answer = response["response"].strip()
            logger.info("Answer generated successfully")
            return answer

        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            raise Exception(
                f"Failed to generate answer. "
                f"Is Ollama running at {settings.ollama_base_url} "
                f"with model '{self.model_name}' pulled?\n"
                f"Run: ollama pull {self.model_name}\n"
                f"Error: {e}"
            )


# ── Singleton ─────────────────────────────────────────────────────────────────
_llm_client: LLMClient | None = None


def get_llm_client() -> LLMClient:
    global _llm_client
    if _llm_client is None:
        _llm_client = LLMClient()
    return _llm_client