"""
PDF text extraction and chunking
"""

from pathlib import Path
from PyPDF2 import PdfReader
from typing import List, Dict
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def extract_text_from_pdf(pdf_path: Path) -> str:
    """
    Extract all text from a PDF file
    """
    try:
        reader = PdfReader(str(pdf_path))
        text = ""
        
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path}: {e}")
        raise


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks
    """
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        
        # Don't add empty chunks
        if chunk.strip():
            chunks.append(chunk)
        
        start += chunk_size - overlap
    
    return chunks


def process_pdf(pdf_path: Path) -> Dict:
    """
    Process a PDF: extract text and chunk it
    """
    logger.info(f"Processing PDF: {pdf_path.name}")
    
    # Extract text
    text = extract_text_from_pdf(pdf_path)
    
    # Chunk text
    chunks = chunk_text(text)
    
    result = {
        "filename": pdf_path.name,
        "total_characters": len(text),
        "num_chunks": len(chunks),
        "chunks": chunks,
        "preview": text[:500] if text else ""
    }
    
    logger.info(f"Processed {pdf_path.name}: {len(chunks)} chunks")
    
    return result