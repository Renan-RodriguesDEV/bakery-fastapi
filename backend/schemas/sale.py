from typing import Optional

from pydantic import BaseModel


class SalePublicSchema(BaseModel):
    id: int
    user_id: int
    product_id: int
    count: int
    value: float
    was_paid: bool
    created_at: bool


class SaleCreateSchema(BaseModel):
    user_id: int
    product_id: int
    count: int
    value: float
    was_paid: bool


class SaleUpdateSchema(BaseModel):
    count: int
    value: float
    was_paid: bool


class SaleUpdatePartialSchema(BaseModel):
    count: Optional[int]
    value: Optional[float]
    was_paid: Optional[bool]
