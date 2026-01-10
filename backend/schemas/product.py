import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class ProductPublicSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
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
    ] = None
    validity: Optional[datetime.datetime] = None
