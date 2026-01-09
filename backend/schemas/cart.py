from typing import Optional

from pydantic import BaseModel


class CartPublicSchema(BaseModel):
    id: int
    user_id: int
    product_id: int
    count: int
    value: float
    was_purchased: bool
    created_at: bool


class CartCreateSchema(BaseModel):
    user_id: int
    product_id: int
    count: int
    value: float
    was_purchased: bool


class CartUpdateSchema(BaseModel):
    count: int
    value: float
    was_purchased: bool


class CartUpdatePartialSchema(BaseModel):
    count: Optional[int]
    value: Optional[float]
    was_purchased: Optional[bool]
