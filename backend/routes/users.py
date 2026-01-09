from auth.auth import get_current_user, hashpasswd
from db.connection import get_session
from db.entities import User
from exceptions.handle_exceptions import (
    exception_access_dained,
    exception_access_dained_for_user,
    exception_missing_content,
    exception_user_not_found,
)
from fastapi import APIRouter, Depends, status
from schemas.user import (
    UserCreateSchema,
    UserListSchema,
    UserSchema,
    UserUpdatePartialSchema,
    UserUpdateSchema,
)
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserSchema, status_code=status.HTTP_200_OK)
def get(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise exception_user_not_found
    return current_user


@router.get("/all", response_model=UserListSchema, status_code=status.HTTP_200_OK)
def get_all(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained
    users = session.query(User).all()
    return {"users": users}


@router.post(
    "/create", response_model=UserCreateSchema, status_code=status.HTTP_201_CREATED
)
def create(user: UserCreateSchema, session: Session = Depends(get_session)):
    user.password = hashpasswd(user.password)
    user_db = User(**user.model_dump())
    session.add(user_db)
    session.commit()
    return user


@router.put("/update/{id}", response_model=UserSchema, status_code=status.HTTP_200_OK)
def update(
    id: int,
    user: UserUpdateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if id != current_user.id and not current_user.is_admin:
        raise exception_access_dained_for_user
    user.password = hashpasswd(user.password)
    # converte o "user" schema em dicionaria para iterar sobre chaves e valores
    user_data = user.model_dump()
    for key, value in user_data.items():
        if not value:
            raise exception_missing_content
        setattr(current_user, key, value)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.patch("/update/{id}", response_model=UserSchema, status_code=status.HTTP_200_OK)
def update_partial(
    id: int,
    user: UserUpdatePartialSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if id != current_user.id and not current_user.is_admin:
        raise exception_access_dained_for_user
    # converte o "user" em um dicionario apenas com campos/valores não nulos
    user_data = user.model_dump(exclude_unset=True)
    # itera sobre as chaves e valores do "user_data"
    for key, value in user_data.items():
        # checa se é a chave senha para hashear o valor
        if key == "password":
            value = hashpasswd(value)
        # seta/altera o atributo "key" do "current_user" para o novo "value"
        setattr(current_user, key, value)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.delete("/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if id != current_user.id and not current_user.is_admin:
        raise exception_access_dained_for_user
    session.delete(current_user)
    session.commit()
    return {
        "status": status.HTTP_204_NO_CONTENT,
        "message": "sucesso ao deletar usuário",
    }
