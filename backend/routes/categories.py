from auth.auth import get_current_user
from db.connection import get_session
from db.entities import Category, Product, User
from exceptions.handle_exceptions import (
    exception_access_dained,
    exception_category_not_found,
    exception_unauthorized_delete,
)
from fastapi import APIRouter, Depends, status
from schemas.category import CategoryCreateSchema, CategorySchema
from sqlalchemy.orm import Session

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/all", status_code=status.HTTP_200_OK, response_model=list[CategorySchema])
async def get_all(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise exception_access_dained
    return session.query(Category).all()


@router.get("/{id}", status_code=status.HTTP_200_OK, response_model=CategorySchema)
async def get(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise exception_access_dained
    category = session.query(Category).filter(Category.id == id).first()
    if not category:
        raise exception_category_not_found
    return category


@router.post(
    "/create", status_code=status.HTTP_201_CREATED, response_model=CategorySchema
)
async def create(
    category: CategoryCreateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained
    category_db = Category(**category.model_dump(exclude_unset=True))
    session.add(category_db)
    session.commit()
    session.refresh(category_db)
    return category_db


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained
    if id == 1:
        raise exception_unauthorized_delete
    category = session.query(Category).filter(Category.id == id).first()
    if not category:
        raise exception_category_not_found
    products = session.query(Product).filter(Product.category_id == id).all()
    for product in products:
        product.category_id = 1
    session.delete(category)
    session.commit()
    return {"message": "Categoria deletada com sucesso!"}
