from typing import List, Optional

from pydantic import BaseModel


class TokenSchema(BaseModel):
    access_token: str
    token_type: str


class UserSchema(BaseModel):
    id: int
    name: str
    username: str
    password: str
    telephone: str | None = None


class UserPublicSchema(BaseModel):
    name: str
    username: str
    password: str
    telephone: str | None = None


class UserListSchema(BaseModel):
    users: List[UserSchema]


class UserCreateSchema(UserPublicSchema):
    is_admin: bool = False


class UserUpdateSchema(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    telephone: Optional[str] = None
