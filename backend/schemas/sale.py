import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict
from schemas.product import ProductSimpleSchema
from schemas.user import UserSimpleSchema


class SalePublicSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    product_id: int
    count: int
    value: float
    payment_id: Optional[str] = None
    was_paid: bool
    user: UserSimpleSchema
    product: ProductSimpleSchema
    created_at: datetime.datetime


class SaleCreateSchema(BaseModel):
    user_id: int
    product_id: int
    count: int
    was_paid: bool = False
    created_at: Optional[datetime.datetime] = None


class SaleUpdateSchema(BaseModel):
    count: int
    payment_id: str
    was_paid: bool = False


class SaleUpdatePartialSchema(BaseModel):
    count: Optional[int] = None
    value: Optional[float] = None
    payment_id: Optional[str] = None
    was_paid: Optional[bool] = None
