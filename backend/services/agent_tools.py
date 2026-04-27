from db.connection import get_session
from langchain.tools import tool
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
