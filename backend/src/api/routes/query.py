"""
Query endpoints for RAG with full pipeline
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.utils.logger import setup_logger
from src.embeddings.embeddings import get_embedding_model
from src.retrieval.vector_store import get_vector_store
from src.generation.ollama_generator import get_generator

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
        
        # Check if there are any documents
        vector_store = get_vector_store()
        if vector_store.count() == 0:
            return QueryResponse(
                query=request.query,
                answer="No documents have been uploaded yet. Please upload a PDF first.",
                sources=[]
            )
        
        # Step 1: Generate query embedding
        embedding_model = get_embedding_model()
        query_embedding = embedding_model.embed_query(request.query)
        
        # Step 2: Retrieve relevant chunks
        results = vector_store.query(
            query_embedding=query_embedding,
            top_k=request.top_k
        )
        
        # Step 3: Generate answer using Ollama
        generator = get_generator()
        answer = generator.generate_answer(
            query=request.query,
            context_chunks=results["documents"]
        )
        
        # Step 4: Format sources
        sources = [
            {
                "text": doc[:200] + "..." if len(doc) > 200 else doc,
                "filename": meta["filename"],
                "chunk_index": meta["chunk_index"],
                "distance": float(dist)
            }
            for doc, meta, dist in zip(
                results["documents"],
                results["metadatas"],
                results["distances"]
            )
        ]
        
        logger.info("Query processed successfully")
        
        return QueryResponse(
            query=request.query,
            answer=answer,
            sources=sources
        )

    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))