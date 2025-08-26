import fitz  # PyMuPDF

def extract_text_from_pdf(file_path):
    """Extract all text from a PDF file."""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()
