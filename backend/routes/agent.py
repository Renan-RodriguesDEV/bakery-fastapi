from fastapi import APIRouter
from schemas.agent import QuestionAgentSchema, ResponseAgentSchema
from services.agent import ask_question

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post(
    "/ask",
)
def ask(question: str):
    return ask_question(question=question)
