import json
from typing import Optional

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from pydantic import BaseModel
from services.agent.db_agent import create_memory, get_memory, save_in_memory
from services.agent.tools import faq, find_products

agent, llm, embedding = None, None, None


class AgentResponse(BaseModel):
    answer: str
    source: Optional[str] = None


def extract_text(response):
    try:
        return response["messages"][-1].content
    except:
        return str(response)


def safe_parse(response):
    try:
        raw = extract_text(response)
        return AgentResponse(**json.loads(raw))
    except:
        return AgentResponse(answer=extract_text(response))


def create_llm():
    global llm
    if llm:
        return llm
    llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
    return llm


def create_agent_llm():
    global agent
    if agent:
        return agent
    agent = create_agent(
        model="google_genai:gemini-2.5-flash",
        system_prompt="""
Você é um assistente de padaria.

    Regras:
    - Use 'find_products' para produtos
    - Use 'faq' para dúvidas comuns
    - Nunca invente respostas
    - Fora do domínio → diga que não sabe

    Responda SEMPRE em JSON:
    {
      "answer": "resposta",
      "source": "opcional"
    }
""",
        tools=[find_products, faq],
    )
    return agent


agent = create_agent_llm()
llm = create_llm()


def create_embedding():
    global embedding
    if embedding:
        return embedding
    embedding = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    return embedding


# embedding é um objeto que converte texto em vetores numéricos para facilitar a busca e comparação de informações.
embedding = create_embedding()
# criando uma memoria com o embedding, ou seja, um espaço onde os textos serão armazenados e organizados de acordo com suas semelhanças.
vectorstore = create_memory(["sem nada inicialmente"], embedding=embedding)


def ask_agent(p: str):
    memory = get_memory(p, vectorstore) or "Sem contexto relevante encontrado."
    prompt = f"""
    Contexto:
    {memory}

    Pergunta:
    {p}

    Responda SOMENTE em JSON:
    {{
      "answer": "resposta",
      "source": "opcional"
    }}
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
    answer_text = extract_text(response)
    parsed = safe_parse(response)
    save_in_memory([f"User:{p}\n: Assintent:{answer_text}"], vectorstore)
    print("Resposta do agente:", response)
    return parsed.model_dump()


def ask_llm(pergunta: str):
    response = llm.invoke(pergunta)
    print("Resposta do LLM:", response)
    return response.content
