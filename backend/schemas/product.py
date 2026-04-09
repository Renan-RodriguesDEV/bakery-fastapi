import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict
from schemas.category import CategorySchema


class ProductSimpleSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    price: float
    stock: int
    category: CategorySchema
    validity: datetime.datetime


class ProductPublicSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    price: float
    stock: int
    category: CategorySchema
    validity: datetime.datetime


class ProductCreateSchema(BaseModel):
    name: str
    price: float
    stock: int
    category_id: int
    validity: datetime.datetime


class ProductUpdateSchema(BaseModel):
    name: str
    price: float
    stock: int
    category_id: int
    validity: datetime.datetime


class ProductUpdatePartialSchema(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    validity: Optional[datetime.datetime] = None
