"""
Document management endpoints
"""

from fastapi import APIRouter
from pathlib import Path
from src.config.settings import settings
from src.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.get("/list")
async def list_documents():
    """
    List all uploaded documents
    """
    try:
        pdf_files = list(settings.raw_pdf_dir.glob("*.pdf"))
        
        documents = [
            {
                "filename": f.name,
                "size": f.stat().st_size,
                "uploaded_at": f.stat().st_mtime
            }
            for f in pdf_files
        ]
        
        return {"documents": documents, "count": len(documents)}
    
    except Exception as e:
        logger.error(f"List error: {e}")
        return {"documents": [], "count": 0, "error": str(e)}