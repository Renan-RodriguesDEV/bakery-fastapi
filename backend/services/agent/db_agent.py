from langchain_community.vectorstores import FAISS
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings


def create_memory(texts: list, embedding: GoogleGenerativeAIEmbeddings):
    """Cria um FAISS a partir dos textos e do embedding."""
    return FAISS.from_texts(texts, embedding=embedding)


def save_in_memory(texts: list[str], vectorstores: FAISS):
    """Salva os textos no FAISS para futuras buscas."""
    vectorstores.add_texts(texts)


def get_memory(query: str, vectorstores: FAISS):
    """Busca os textos parecido ou mais relevantes para a query usando o FAISS."""
    docs = vectorstores.similarity_search(query, k=2)
    return "\n".join([d.page_content for d in docs])
