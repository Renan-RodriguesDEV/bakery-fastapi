import json
from typing import Optional

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from pydantic import BaseModel

# from services.agent.db_agent import create_memory, get_memory, save_in_memory
from services.agent.tools import faq, find_products

_agent, llm, embedding = None, None, None


class AgentResponse(BaseModel):
    answer: str
    source: Optional[str] = None


def check_type_answer(res: dict):
    try:
        if res.get("messages"):
            answer = res.get("messages")[-1].content
            return answer if not isinstance(answer, list) else answer[0].get("text")
        return res.content
    except Exception as e:
        print("Erro ao processar resposta do agente:", e)
        return "Desculpe, ocorreu um erro ao processar a resposta."


def create_llm():
    global llm
    if llm:
        return llm
    llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
    return llm


def create_agent_llm():
    global _agent
    tools = [find_products, faq]
    if _agent:
        return _agent
    _agent = create_agent(
        model="google_genai:gemini-2.5-flash",
        system_prompt="""
Você é um assistente de padaria.

    Regras:
    - Use 'find_products' para produtos
    - Use 'faq' para dúvidas comuns
    - Nunca invente respostas
    - Fora do domínio → diga que não sabe

    Responda SEMPRE em Markdown, mesmo que seja apenas texto simples.
    Ex.: 2 + 2 = 4 (fonte se houver).
""",
        tools=tools,
        debug=True,
    )
    return _agent


agent = create_agent_llm()
llm = create_llm()


def create_embedding():
    global embedding
    if embedding:
        return embedding
    embedding = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    return embedding


# embedding é um objeto que converte texto em vetores numéricos para facilitar a busca e comparação de informações.
# embedding = create_embedding()
# criando uma memoria com o embedding, ou seja, um espaço onde os textos serão armazenados e organizados de acordo com suas semelhanças.
# vectorstore = create_memory(["sem nada inicialmente"], embedding=embedding)


def ask_agent(pergunta: str):
    # memory = get_memory(pergunta, vectorstore) or "Sem contexto relevante encontrado."
    # Contexto:
    # {memory}
    prompt = f"""

    Pergunta:
    {pergunta}

    Responda SEMPRE em Markdown, mesmo que seja apenas texto simples.
    Ex.: 2 + 2 = 4 (fonte se houver).
    """
    response = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ]
        }
    )
    print("Resposta do agente:", response)
    print("Tipo da resposta do LLM:", type(response))
    checked_response = check_type_answer(response)
    return checked_response


def ask_llm(pergunta: str):
    response = llm.invoke(pergunta)
    print("Resposta do LLM:", response)
    print("Tipo da resposta do LLM:", type(response))
    return response.content
