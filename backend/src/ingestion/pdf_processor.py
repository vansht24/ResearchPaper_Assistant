"""
PDF text extraction and chunking
"""

from pathlib import Path
from PyPDF2 import PdfReader
from typing import List, Dict
from src.utils.logger import setup_logger
from src.config.settings import settings

logger = setup_logger(__name__)


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract raw text from every page of a PDF."""
    try:
        reader = PdfReader(str(pdf_path))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
        return "\n".join(pages_text).strip()
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path.name}: {e}")
        raise


def chunk_text(
    text: str,
    chunk_size: int = None,
    overlap: int = None,
) -> List[str]:
    """
    Split text into overlapping chunks.

    Args:
        text:       Raw document text.
        chunk_size: Characters per chunk (defaults to settings.chunk_size).
        overlap:    Overlap between consecutive chunks (defaults to settings.chunk_overlap).
    """
    chunk_size = chunk_size or settings.chunk_size
    overlap    = overlap    or settings.chunk_overlap

    chunks, start = [], 0
    while start < len(text):
        chunk = text[start : start + chunk_size]
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap

    return chunks


def process_pdf(pdf_path: Path) -> Dict:
    """
    Full ingestion pipeline for a single PDF:
    extract → chunk → return metadata dict.
    """
    logger.info(
        f"Processing: {pdf_path.name} "
        f"(chunk_size={settings.chunk_size}, overlap={settings.chunk_overlap})"
    )

    text   = extract_text_from_pdf(pdf_path)
    chunks = chunk_text(text)

    logger.info(f"Produced {len(chunks)} chunks from {pdf_path.name}")

    return {
        "filename":         pdf_path.name,
        "total_characters": len(text),
        "num_chunks":       len(chunks),
        "chunks":           chunks,
        "preview":          text[:500] if text else "",
    }