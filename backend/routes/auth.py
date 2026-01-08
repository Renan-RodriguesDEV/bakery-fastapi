from auth.auth import checkpasswd, create_access_token
from db.connection import get_session
from db.entities import User
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from schemas.schemas import TokenSchema
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=TokenSchema)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )
    if not checkpasswd(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Senha incorreta"
        )
    data = {"sub": form_data.username, "admin": user.is_admin}
    access_token = create_access_token(data=data)
    token = TokenSchema(access_token=access_token, token_type="bearer")
    return token
