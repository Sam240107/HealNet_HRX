# backend/llm_handler.py

import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def process_query(query: str, context_chunks: list, age: int, location: str):
    context = "\n\n".join(context_chunks)
    
    prompt = f"""
User Profile:
- Age: {age}
- Location: {location}

User Query:
"{query}"

Policy Context:
{context}

Based on the policy clauses, determine:
- Whether the user is eligible or not
- A short reason
- Cite the most relevant clause

Respond in JSON with keys: decision, justification, clause_excerpt
"""
    try:
        completion = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a policy assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return {"error": str(e)}
