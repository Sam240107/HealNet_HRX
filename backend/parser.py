# backend/parser.py
import fitz  # PyMuPDF

def extract_text_from_pdf(file_path):
    """
    Extract all text from a PDF file.
    """
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text
