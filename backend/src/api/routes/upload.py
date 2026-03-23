from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from pathlib import Path

from src.utils.logger import setup_logger
from src.ingestion.pdf_processor import process_pdf
from src.retrieval.vector_store import get_vector_store
from src.embeddings.embedding_manager import get_embedding_manager

logger = setup_logger(__name__)

# This is the exact variable main.py is looking for!
router = APIRouter()

@router.post("/")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        # 1. Define where to save the uploaded PDF
        save_directory = "data/raw_pdfs"
        os.makedirs(save_directory, exist_ok=True)
        file_path = os.path.join(save_directory, file.filename)

        # 2. Save the file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"Successfully saved uploaded file to {file_path}")

        # 3. Extract and chunk the PDF text
        pdf_data = process_pdf(Path(file_path))
        chunks = pdf_data["chunks"]

        if chunks:
            # 4. Generate embeddings for the chunks using the CORRECT method name
            embedder = get_embedding_manager()
            embeddings = embedder.embed_texts(chunks)

            # 5. Prepare metadata and unique IDs for ChromaDB
            metadatas = [{"filename": file.filename, "chunk_index": i} for i in range(len(chunks))]
            ids = [f"{file.filename}_chunk_{i}_{uuid.uuid4().hex[:8]}" for i in range(len(chunks))]

            # 6. Save everything to the Vector Store
            vector_store = get_vector_store()
            vector_store.add_documents(
                texts=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Successfully indexed {len(chunks)} chunks for {file.filename}")

        # 7. Return the success message with stats for the frontend UI
        return {
            "message": "File uploaded and indexed successfully", 
            "filename": file.filename,
            "size": os.path.getsize(file_path),
            "num_chunks": pdf_data["num_chunks"],
            "total_characters": pdf_data["total_characters"]
        }

    except Exception as e:
        logger.error(f"Failed to upload document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")

@router.get("/")
async def list_documents():
    """Returns a list of all uploaded PDFs for the frontend Library tab."""
    save_directory = "data/raw_pdfs"
    
    # Return an empty list wrapped in the "documents" key React expects
    if not os.path.exists(save_directory):
        return {"documents": []}
        
    docs = []
    for f in os.listdir(save_directory):
        if f.endswith('.pdf'):
            file_path = os.path.join(save_directory, f)
            docs.append({
                "filename": f,
                "size": os.path.getsize(file_path),               # Sends the file size!
                "uploaded_at": os.path.getmtime(file_path)        # Sends the upload timestamp!
            })
    
    # Wrap the list in the exact JSON structure React is looking for
    return {"documents": docs}

@router.delete("/{filename}")
async def delete_document(filename: str):
    """Deletes a specific PDF when the trash icon is clicked in the UI."""
    save_directory = "data/raw_pdfs"
    file_path = os.path.join(save_directory, filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        
        # Also delete the chunks from the vector database!
        vector_store = get_vector_store()
        vector_store.delete_by_filename(filename)
        
        logger.info(f"Deleted file and chunks for: {filename}")
        return {"message": f"Successfully deleted {filename}"}
    else:
        raise HTTPException(status_code=404, detail="File not found")