import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserSchema(BaseModel):
    # model_config para permitir a criação do schema a partir de um ORM
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    username: EmailStr
    password: str
    telephone: Optional[str]
    token: Optional[str]
    is_admin: bool
    created_at: datetime.datetime


class UserCreateSchema(BaseModel):
    name: str
    username: EmailStr
    password: str
    telephone: Optional[str] = None
    is_admin: bool = False


class UserUpdateSchema(BaseModel):
    name: str
    username: EmailStr
    password: str
    telephone: Optional[str] = None
    token: Optional[str] = None


class UserUpdatePartialSchema(BaseModel):
    name: Optional[str] = None
    username: Optional[EmailStr] = None
    password: Optional[str] = None
    telephone: Optional[str] = None
    token: Optional[str] = None
