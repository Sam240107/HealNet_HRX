import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env from backend folder
BASE_DIR = os.path.dirname(__file__)
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env file")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "models/embedding-001")

def get_embeddings(text_list):
    """
    Get embeddings for a list of strings using Google Gemini API.
    """
    embeddings = []
    for text in text_list:
        result = genai.embed_content(model=EMBED_MODEL, content=text)
        embeddings.append(result["embedding"])
    return embeddings
