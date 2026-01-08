import datetime

import bcrypt
import jwt
from config.config import credentials
from db.connection import get_session
from db.entities import Administrator, Client
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

oauth2_schema = OAuth2PasswordBearer(tokenUrl="/auth/token")

ALGORITHM = credentials.get("ALGORITHM")
SECRET_KEY = credentials.get("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_TIME = int(credentials.get("ACCESS_TOKEN_EXPIRE_TIME"))


def create_access_token(
    data: dict, expire_in_timedelta: datetime.timedelta | None = None
):
    """Cria um token JWT para o usuario e o adiciona nos headers da sessão dele

    Args:
        data (dict): dicionario com as chaves sub e etc. referente ao token jwt
        expire_in_timedelta (datetime.timedelta | None, optional): tempo de expiração do token em timedelta. Defaults to None.

    Returns:
        token (str): Token JWT para o cabeçalho da sessão do usuario.
    """
    data_copy = data.copy()
    # definindo tempo de exp com tempo atual + timedelta em minutos
    exp = datetime.datetime.utcnow() + expire_in_timedelta | datetime.timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_TIME
    )
    data_copy.update({"exp": exp})
    return jwt.encode(payload=data_copy, key=SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    session: Session = Depends(get_session), token: str = Depends(oauth2_schema)
):
    """Pega o usuario atual pelo seu token nos headers da sessão.

    Args:
        session (Session, optional): função para pegar a sessão com banco de dados, depends pois é um injeção de dependencia. Defaults to Depends(get_session).
        token (str, optional): instância de OAuth2PasswordBearer que extrai o token do cabeçalho Authorization. Defaults to Depends(oauth2_schema).

    Returns:
        user (Client|Administrator): retorna o usuario atual pelo token.
    """
    exception_unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Suas credenciais foram invalidadas, acesso negado",
        headers={"WWW-Authentication": "Bearer"},
    )
    try:
        payload: dict = jwt.decode(token, key=SECRET_KEY, algorithms=ALGORITHM)
        username: str = payload.get("sub")
        admin: str = payload.get("admin")
    except jwt.DecodeError:
        raise exception_unauthorized
    if admin:
        user = session.query(Administrator).filter(Administrator.username == username)
    else:
        user = session.query(Client).filter(Client.username == username)
    if not user:
        raise exception_unauthorized
    return user


def hashpasswd(password: str):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")


def checkpasswd(password: str, password_hashed: str):
    return bcrypt.checkpw(password.encode("utf-8"), password_hashed.encode("utf-8"))
