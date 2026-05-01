from fastapi import APIRouter
from services.agent.agent import ask_agent, ask_llm

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post(
    "/ask-llm",
)
def ask_for_llm(question: str):
    return ask_llm(pergunta=question)


@router.post(
    "/ask-agent",
)
def ask_for_agent(question: str):
    """
    Endpoint padronizado para fazer perguntas ao agente de IA.

    Retorna sempre um dicionário com:
    {
        "response": "texto da resposta",
        "type": "text" | "error",
        "success": true | false
    }
    """
    result = ask_agent(pergunta=question)
    # breakpoint()
    return result
