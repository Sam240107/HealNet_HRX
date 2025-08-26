# llm_utils.py
import os
import openai
from dotenv import load_dotenv
load_dotenv()

LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4")
openai.api_key = os.getenv("OPENAI_API_KEY")

PROMPT_TEMPLATE = """
You are an insurance policy analyst. A user asked: "{query}"

Below are the most relevant clauses extracted from the policy (numbered). Use only the provided clauses to decide whether the user's query is covered. Provide:
1) decision: "Covered" or "Not Covered" or "Maybe/Need more info"
2) amount (if stated) or "N/A"
3) justification: short explanation mapping to clause numbers
4) the exact clause text used (include clause id)

Clauses:
{clauses}

Answer in strict JSON with keys: decision, amount, justification, clauses_used
"""

def ask_llm(query, top_chunks):
    """
    top_chunks: list of dicts [{'id':id, 'text': chunk}, ...]
    """
    clauses_text = "\n\n".join([f"[{c['id']}]: {c['text']}" for c in top_chunks])
    prompt = PROMPT_TEMPLATE.format(query=query, clauses=clauses_text)

    resp = openai.ChatCompletion.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": "You are an expert insurance policy analyst."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.0,
    )

    return resp["choices"][0]["message"]["content"]
