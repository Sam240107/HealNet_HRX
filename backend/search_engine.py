# backend/search_engine.py

import faiss
from sentence_transformers import SentenceTransformer
import numpy as np

# Load sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def search_documents(chunks: list, query: str, top_k=3):
    # Embed the document chunks
    chunk_embeddings = model.encode(chunks)
    
    # Create FAISS index
    dim = chunk_embeddings[0].shape[0]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(chunk_embeddings))

    # Embed the query
    query_embedding = model.encode([query])
    
    # Search for top matches
    distances, indices = index.search(np.array(query_embedding), top_k)
    results = [chunks[i] for i in indices[0]]
    return results
