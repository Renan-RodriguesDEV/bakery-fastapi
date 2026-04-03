import secrets

from auth.auth import hashpasswd
from db.entities import User
from exceptions.handle_exceptions import (
    exception_invalid_token,
    exception_user_not_found,
)
from services.email import SenderMail
from sqlalchemy.orm import Session


def forgot_password(session: Session, username: str):
    user = session.query(User).filter(User.username == username).first()
    if not user:
        raise exception_user_not_found
    token = create_reset_token(user, session)
    sender_mail = SenderMail()
    content = f"""Olá, {username}.

Conforme solicitado, segue o seu token para recuperação de senha: {token}

Caso não tenha solicitado esta alteração, por favor, desconsidere esta mensagem.

Atenciosamente,
Equipe de suporte
"""
    sender_mail.async_send(username, content, "Recuperação de senha")
    return token


def reset_password(username: str, password: str, reset_token: str, session: Session):
    user = session.query(User).filter(User.username == username).first()
    if not user:
        raise exception_user_not_found
    if not user.token == reset_token:
        raise exception_invalid_token
    user.password = hashpasswd(password)
    session.commit()
    session.refresh(user)
    return user.password


def create_reset_token(user: User, session: Session):
    token = secrets.token_hex(12)
    user.token = token
    session.commit()
    session.refresh(user)
    return user.token
