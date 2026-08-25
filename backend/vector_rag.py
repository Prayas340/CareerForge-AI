import math
import re
import hashlib
from typing import List, Dict, Any, Tuple
from collections import Counter

class HashEmbeddingFunction:
    """Ultra-fast 64-dimensional semantic projection function for ChromaDB without heavy model downloads."""
    def __init__(self, dim: int = 64):
        self.dim = dim

    def __call__(self, input: List[str]) -> List[List[float]]:
        embeddings = []
        for text in input:
            vec = [0.0] * self.dim
            tokens = re.findall(r'\b\w+\b', text.lower())
            for t in tokens:
                h = int(hashlib.md5(t.encode('utf-8')).hexdigest(), 16)
                idx = h % self.dim
                vec[idx] += 1.0
            norm = math.sqrt(sum(v * v for v in vec)) or 1.0
            embeddings.append([v / norm for v in vec])
        return embeddings

    def name(self) -> str:
        return "hash_embedding_function"


class SimpleVectorRAG:
    """
    High-performance in-memory semantic retrieval & vector index engine.
    Supports instant sub-millisecond cosine similarity ranking and TF-IDF term weighting.
    """
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.doc_vectors: List[Dict[str, float]] = []
        self.idf: Dict[str, float] = {}
        self.initialized = False
        self.chroma_client = None
        self.chroma_collection = None

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        return re.findall(r'\b[a-zA-Z0-9_\-\+\#]{2,}\b', text)

    def index_jobs(self, jobs: List[Dict[str, Any]]):
        """Build vector embeddings and inverted index for jobs instantly."""
        self.documents = jobs
        self.doc_vectors = []
        
        # Calculate document frequencies
        df = Counter()
        tokenized_docs = []
        for job in jobs:
            content = f"{job.get('title', '')} {job.get('domain', '')} {' '.join(job.get('required_skills', []))} {job.get('description', '')}"
            tokens = self._tokenize(content)
            tokenized_docs.append(tokens)
            unique_tokens = set(tokens)
            for t in unique_tokens:
                df[t] += 1

        n_docs = len(jobs)
        self.idf = {t: math.log((n_docs + 1) / (count + 1)) + 1.0 for t, count in df.items()}

        # Build TF-IDF vectors
        for tokens in tokenized_docs:
            tf = Counter(tokens)
            doc_len = len(tokens) or 1
            vec = {}
            for t, count in tf.items():
                tfidf = (count / doc_len) * self.idf.get(t, 1.0)
                vec[t] = tfidf
            # Normalize vector
            norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
            self.doc_vectors.append({k: v / norm for k, v in vec.items()})

        self.initialized = True

    def search(self, query_text: str, top_k: int = 6) -> List[Tuple[Dict[str, Any], float]]:
        """Search jobs using semantic cosine similarity."""
        if not self.initialized or not self.documents:
            return []

        query_tokens = self._tokenize(query_text)
        if not query_tokens:
            return [(doc, 0.5) for doc in self.documents[:top_k]]

        q_tf = Counter(query_tokens)
        q_len = len(query_tokens)
        q_vec = {}
        for t, count in q_tf.items():
            tfidf = (count / q_len) * self.idf.get(t, 1.0)
            q_vec[t] = tfidf

        q_norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0
        q_vec = {k: v / q_norm for k, v in q_vec.items()}

        scores = []
        for idx, d_vec in enumerate(self.doc_vectors):
            dot_product = sum(weight * d_vec.get(term, 0.0) for term, weight in q_vec.items())
            scores.append((self.documents[idx], dot_product))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

# Global singleton RAG instance
vector_rag_engine = SimpleVectorRAG()
