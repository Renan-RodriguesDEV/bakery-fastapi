from typing import Literal

from pydantic import BaseModel


class ResponseAgentSchema(BaseModel):
    response: str
    fontes: list[str]
    is_found: bool


class QuestionAgentSchema(BaseModel):
    question: str
    tone: Literal["formal", "casual", "neutro"] = "neutro"
