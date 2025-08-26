import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env file")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

def chat_with_gemini(prompt: str) -> str:
    """
    Sends a prompt to Gemini and returns a short, direct answer.
    This is synchronous to avoid coroutine serialization issues.
    """
    try:
        # Use the fast & cheaper model
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Send request
        response = model.generate_content(prompt)

        # Extract text safely
        if response and hasattr(response, "text"):
            return response.text.strip()
        elif response and hasattr(response, "candidates") and response.candidates:
            return response.candidates[0].content.parts[0].text.strip()
        else:
            return "⚠️ No answer from Gemini."
    except Exception as e:
        return f"⚠️ Gemini API error: {str(e)}"
