from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.settings import settings
from src.utils.logger import setup_logger
from src.api.routes import upload, documents, query

logger = setup_logger(__name__)

app = FastAPI(
    title="Scholara — Research Paper RAG API",
    version="1.0.0",
    description="RAG-powered Q&A over research PDFs using Ollama + ChromaDB",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,  # uses the property, not the raw string
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router,    prefix="/api/documents", tags=["Upload"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(query.router,     prefix="/api/query",     tags=["Query"])


@app.get("/")
def root():
    logger.info("Root endpoint hit")
    return {
        "status":          "running",
        "environment":     settings.environment,
        "ollama_model":    settings.ollama_model,
        "embedding_model": settings.embedding_model,
        "chunk_size":      settings.chunk_size,
        "chunk_overlap":   settings.chunk_overlap,
        "top_k":           settings.top_k_results,
    }