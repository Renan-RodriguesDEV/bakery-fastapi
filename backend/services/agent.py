import os

from db.connection import get_session
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
from langgraph.store.memory import InMemoryStore
from sqlalchemy import text


@tool(
    "find_products",
    description="Encontre produtos na base de dados da padaria da vila, com valores, estoque e etc.",
)
def find_products(query: str):
    session = next(get_session())
    result = session.execute(
        text(
            "SELECT name, price, stock, validity, c.name as category FROM produtos p JOIN categorias c ON p.category_id = c.id"
        )
    )
    return [p._asdict() for p in result.fetchall()] if result else []


@tool(
    "faq",
    description="Responda perguntas frequentes sobre a padaria da vila, como endereço, horário de funcionamento, contato, etc.",
)
def faq(query: str):
    return """
Nome da loja: Padaria da Vila
Endereço: Rua Pedro Gonçalves da Silva, 11 - Jardim Eldorado, Itaí - SP, 18734-352
Horário de funcionamento: Segunda a sexta, das 6h às 20h; Sábado, das 6h às 18h; Domingo, das 7h às 13h.
Contato: (19) 99872-2472 | renanrodrigues@gmail.com
"""


load_dotenv()


def create_llm(model: str, temperature: float, api_key: str):
    return ChatGoogleGenerativeAI(model=model, temperature=temperature, api_key=api_key)


def get_agent(model: ChatGoogleGenerativeAI):
    # A "loja" de memória (onde ele guarda os fatos)
    store = InMemoryStore()

    # Criando o agente com o novo método create_agent
    agent = create_agent(
        model,
        tools=[find_products, faq],
        store=store,
        system_prompt="Você é o atendente da Padaria da Vila.",
    )
    return agent


def ask_question(question: str):
    llm = create_llm(
        model="gemini-2.0-flash",
        temperature=0.1,
        api_key=os.getenv("GOOGLE_API_KEY"),
    )
    agent = get_agent(llm)
    response = agent.invoke(
        {"messages": [{"role": "user", "content": f"Pergunta: {question}"}]}
    )
    return response
