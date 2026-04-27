from langchain_community.vectorstores import FAISS
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings


def create_memory(texts: list, embedding: GoogleGenerativeAIEmbeddings):
    return FAISS.from_texts(texts, embedding=embedding)


def save_in_memory(texts: list[str], vectorstores: FAISS):
    vectorstores.add_texts(texts)


def search_in_memory(query: str, vectorstores: FAISS):
    docs = vectorstores.similarity_search(query, k=2)
    return "\n".join([d.page_content for d in docs])


def get_retriver(vectorstores: FAISS):
    return vectorstores.as_retriever(search_kwargs={"k": 2})
