from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from services.agent.tools import faq, find_products

chat_memory = []


def create_llm():
    llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
    return llm


def create_agent_llm():
    agent = create_agent(
        model="google_genai:gemini-2.5-flash",
        system_prompt="Você é um assistente de IA, com foco apenas em padarias, responda apenas fatos ou perguntas relacionadas a padarias, caso a pergunta seja fora de padaria, responda que não tem conhecimento sobre o assunto. Use as ferramentas disponíveis para responder as perguntas, caso necessário.",
        tools=[find_products, faq],
    )
    return agent


def create_embedding():
    return GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")


def _extract_response(message) -> str:
    """Extrai o texto da resposta de forma simples e padronizada."""
    return (
        message.content
        if isinstance(message.content, str)
        else (
            message.content[0].get("text", str(message.content))
            if isinstance(message.content, list)
            and message.content
            and isinstance(message.content[0], dict)
            else str(message.content)
        )
    )


def ask_agent(p: str):
    chat_memory_joined = "\n".join(
        [f"{m['role']}: {m['content']}" for m in chat_memory]
    )
    response = create_agent_llm().invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": f"No contexto: {chat_memory_joined}\nResponda a seguinte pergunta: {p}",
                }
            ]
        }
    )
    chat_memory.append({"role": "user", "content": p})

    if response and "messages" in response and response["messages"]:
        last_message = response["messages"][-1]
        text = _extract_response(last_message)
        chat_memory.append({"role": "assistant", "content": text})
        return {"response": text, "success": True}

    return {"response": "Nenhuma resposta recebida", "success": False}


def ask_llm(pergunta: str):
    return create_llm().invoke(pergunta).content
