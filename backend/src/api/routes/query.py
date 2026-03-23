"""
Query route — POST /api/query/
              GET  /api/query/health
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from src.utils.logger import setup_logger
from src.embeddings.embedding_manager import get_embedding_manager
from src.retrieval.vector_store import get_vector_store
from src.generation.llm_client import get_llm_client
from src.config.settings import settings

router = APIRouter()
logger = setup_logger(__name__)


class QueryRequest(BaseModel):
    query:  str
    top_k:  int = settings.top_k_results


class SourceItem(BaseModel):
    text:        str
    filename:    str
    chunk_index: int
    distance:    float


class QueryResponse(BaseModel):
    query:   str
    answer:  str
    sources: List[SourceItem]


@router.post("/", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """RAG query: embed → retrieve → generate → return answer + sources."""
    try:
        logger.info(f"Query: {request.query}")

        store = get_vector_store()
        if store.count() == 0:
            return QueryResponse(
                query=request.query,
                answer="No documents have been uploaded yet. Please upload a PDF first.",
                sources=[],
            )

        # 1. Embed the query
        manager         = get_embedding_manager()
        query_embedding = manager.embed_query(request.query)

        # 2. Retrieve top-k chunks
        results = store.query(
            query_embedding=query_embedding,
            top_k=request.top_k,
        )

        # 3. Generate answer
        client = get_llm_client()
        answer = client.generate_answer(
            query=request.query,
            context_chunks=results["documents"],
        )

        # 4. Build source list (truncate long chunks for display)
        sources = [
            SourceItem(
                text        = doc[:300] + "…" if len(doc) > 300 else doc,
                filename    = meta["filename"],
                chunk_index = meta["chunk_index"],
                distance    = float(dist),
            )
            for doc, meta, dist in zip(
                results["documents"],
                results["metadatas"],
                results["distances"],
            )
        ]

        logger.info("Query processed successfully")
        return QueryResponse(query=request.query, answer=answer, sources=sources)

    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "model":  settings.ollama_model,
        "top_k":  settings.top_k_results,
    }