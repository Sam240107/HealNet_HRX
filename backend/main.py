import os
import fitz
import re
import asyncio
from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from gemini_utils import chat_with_gemini

# Load .env variables
load_dotenv()

os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

chunks = []

schemes = [
    {"name": "Health Plus Plan", "keywords": ["surgery", "surgical", "operation", "hospital", "procedure"]},
    {"name": "Accident Shield Policy", "keywords": ["accident", "injury", "fracture", "trauma"]},
    {"name": "Cancer Care Policy", "keywords": ["cancer", "chemotherapy", "tumor", "oncology"]},
    {"name": "Maternity Care Plan", "keywords": ["maternity", "pregnancy", "childbirth", "prenatal", "delivery"]},
    {"name": "Cardio Secure Plan", "keywords": ["heart", "cardiac", "bypass", "angioplasty"]},
]

def split_text(text, max_words=200):
    words = text.split()
    return [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]

def normalize(text):
    return re.sub(r"[^\w\s]", " ", text.lower())

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global chunks
    try:
        content = await file.read()
        with open("temp.pdf", "wb") as f:
            f.write(content)

        doc = fitz.open("temp.pdf")
        text = "".join(page.get_text() for page in doc)

        chunks = split_text(text)
        return {"message": f"✅ PDF uploaded and split into {len(chunks)} chunks."}
    except Exception as e:
        return {"error": str(e)}

@app.post("/ask")
async def ask_question(question: str = Form(...)):
    global chunks
    if not chunks:
        return {"error": "❌ Please upload a PDF first."}

    try:
        # Step 1: Pick best chunk
        best_chunk = max(
            chunks,
            key=lambda ch: sum(w.lower() in ch.lower() for w in question.split())
        )

        # Step 2: Build prompt
        prompt = (
            f"Document excerpt:\n{best_chunk}\n\n"
            f"Question: {question}\n"
            f"Answer in a short, direct, human-friendly way (max 25 words)."
        )

        # Step 3: Try Gemini API, fallback if quota error or other exception
        try:
            answer = await asyncio.to_thread(chat_with_gemini, prompt)
        except Exception as e:
            print(f"⚠️ Gemini API error: {e}")
            answer = "AI service unavailable right now. Using offline keyword match."

        # Step 4: Keyword match for recommendation
        normalized_text = normalize(f"{question} {answer}")
        recommended = None
        for scheme in schemes:
            if any(re.search(rf"\b{k.lower()}\b", normalized_text) for k in scheme["keywords"]):
                recommended = f"We recommend: {scheme['name']}"
                break

        if not recommended:
            recommended = "We recommend: General Health Protection Plan"

        return {
            "answer": answer.strip(),
            "recommendation": recommended
        }

    except Exception as e:
        return {"error": str(e)}

    
