"""
Document management endpoints with RAG pipeline
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from src.config.settings import settings
from src.utils.logger import setup_logger
from src.ingestion.pdf_processor import process_pdf
from src.embeddings.embeddings import get_embedding_model
from src.retrieval.vector_store import get_vector_store
import shutil

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file and process it for RAG
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Ensure directories exist
        settings.create_directories()
        
        # Save file
        file_path = Path(settings.raw_pdf_dir) / file.filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"PDF uploaded: {file.filename}")
        
        # Process PDF: extract text and chunk it
        pdf_data = process_pdf(file_path)
        
        # Generate embeddings
        embedding_model = get_embedding_model()
        embeddings = embedding_model.embed_texts(pdf_data["chunks"])
        
        # Store in vector database
        vector_store = get_vector_store()
        
        # Create IDs and metadata for each chunk
        ids = [f"{file.filename}_chunk_{i}" for i in range(len(pdf_data["chunks"]))]
        metadatas = [
            {
                "filename": file.filename,
                "chunk_index": i,
                "total_chunks": len(pdf_data["chunks"])
            }
            for i in range(len(pdf_data["chunks"]))
        ]
        
        vector_store.add_documents(
            texts=pdf_data["chunks"],
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        logger.info(f"Processed and stored {len(pdf_data['chunks'])} chunks from {file.filename}")
        
        return {
            "message": "File uploaded and processed successfully",
            "filename": file.filename,
            "size": file_path.stat().st_size,
            "total_characters": pdf_data["total_characters"],
            "num_chunks": pdf_data["num_chunks"],
            "preview": pdf_data["preview"]
        }
    
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_documents():
    """
    List all uploaded documents
    """
    try:
        # Ensure directories exist
        settings.create_directories()
        
        pdf_dir = Path(settings.raw_pdf_dir)
        pdf_files = list(pdf_dir.glob("*.pdf"))
        
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


@router.delete("/{filename}")
async def delete_document(filename: str):
    """
    Delete a document and its vector embeddings
    """
    try:
        file_path = Path(settings.raw_pdf_dir) / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete from vector store
        vector_store = get_vector_store()
        vector_store.delete_by_filename(filename)
        
        # Delete file
        file_path.unlink()
        logger.info(f"Deleted: {filename}")
        
        return {"message": "File deleted successfully", "filename": filename}
    
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))