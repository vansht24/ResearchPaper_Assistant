"""
Documents route — GET /api/documents/list
                  DELETE /api/documents/{filename}
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path

from src.config.settings import settings
from src.utils.logger import setup_logger
from src.retrieval.vector_store import get_vector_store

router = APIRouter()
logger = setup_logger(__name__)


@router.get("/list")
async def list_documents():
    """Return all uploaded PDFs with size and upload timestamp."""
    try:
        settings.create_directories()
        pdf_dir  = Path(settings.raw_pdf_dir)
        pdf_files = sorted(
            pdf_dir.glob("*.pdf"),
            key=lambda f: f.stat().st_mtime,
            reverse=True,
        )
        documents = [
            {
                "filename":    f.name,
                "size":        f.stat().st_size,
                "uploaded_at": f.stat().st_mtime,
            }
            for f in pdf_files
        ]
        return {"documents": documents, "count": len(documents)}

    except Exception as e:
        logger.error(f"List error: {e}")
        return {"documents": [], "count": 0, "error": str(e)}


@router.delete("/{filename}")
async def delete_document(filename: str):
    """Delete a PDF and remove all its embeddings from ChromaDB."""
    try:
        file_path = Path(settings.raw_pdf_dir) / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found.")

        # Remove embeddings first
        store = get_vector_store()
        store.delete_by_filename(filename)

        # Remove file
        file_path.unlink()
        logger.info(f"Deleted: {filename}")

        return {"message": "File deleted successfully.", "filename": filename}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))