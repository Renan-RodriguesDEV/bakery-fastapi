import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class ProductPublicSchema(BaseModel):
    id: int
    name: str
    price: float
    stock: int
    category: str
    validity: datetime.datetime


class ProductCreateSchema(BaseModel):
    name: str
    price: float
    stock: int
    category: Literal[
        "Pães",
        "Confeitaria simples",
        "Salgados",
        "Frios e laticínios",
        "Bebidas",
        "Itens de conveniência básica",
        "Produtos embalados essenciais",
    ]
    validity: datetime.datetime


class ProductUpdateSchema(BaseModel):
    name: str
    price: float
    stock: int
    category: Literal[
        "Pães",
        "Confeitaria simples",
        "Salgados",
        "Frios e laticínios",
        "Bebidas",
        "Itens de conveniência básica",
        "Produtos embalados essenciais",
    ]
    validity: datetime.datetime


class ProductUpdatePartialSchema(BaseModel):
    name: Optional[str]
    price: Optional[float]
    stock: Optional[int]
    category: Optional[
        Literal[
            "Pães",
            "Confeitaria simples",
            "Salgados",
            "Frios e laticínios",
            "Bebidas",
            "Itens de conveniência básica",
            "Produtos embalados essenciais",
        ]
    ]
    validity: Optional[datetime.datetime]
