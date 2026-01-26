"""
Query endpoints for RAG
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class QueryResponse(BaseModel):
    query: str
    answer: str
    sources: list


@router.post("/", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Query uploaded documents using RAG
    """
    try:
        logger.info(f"Query received: {request.query}")

        return QueryResponse(
            query=request.query,
            answer="Placeholder response - RAG pipeline coming next",
            sources=[]
        )

    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
