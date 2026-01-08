from pydantic import BaseModel


class TokenSchema(BaseModel):
    access_token: str
    token_type: str


class UserCreateSchema(BaseModel):
    name: str
    username: str
    password: str
    telephone: str | None = None
    is_admin: bool = False
