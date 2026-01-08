from auth.auth import get_current_user, hashpasswd
from db.connection import get_session
from db.entities import User
from fastapi import APIRouter, Depends
from schemas.schemas import UserCreateSchema
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def read_user(
    session: Session = Depends(get_session), current_user=Depends(get_current_user)
):
    return {"message": "This is a placeholder for user info."}


@router.post("/create")
def create(user: UserCreateSchema, session: Session = Depends(get_session)):
    print(user)
    user.password = hashpasswd(user.password)
    user_db = User(
        user.name,
        user.username,
        user.password,
        user.telephone,
        is_admin=user.is_admin,
    )
    print(user_db.name)
    # session.add(user_db)
    # session.commit()
    return user
