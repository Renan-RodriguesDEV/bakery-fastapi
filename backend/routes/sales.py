from typing import Optional

from auth.auth import get_current_user
from db.connection import get_session
from db.entities import Sale, User
from exceptions.handle_exceptions import (
    exception_access_dained_for_user,
    exception_missing_content,
)
from fastapi import APIRouter, Depends, status
from schemas.sale import (
    SaleCreateSchema,
    SalePublicSchema,
    SaleUpdatePartialSchema,
    SaleUpdateSchema,
)
from sqlalchemy.orm import Session

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get(
    "/all", response_model=list[SalePublicSchema], status_code=status.HTTP_200_OK
)
def get_all(
    user_id: Optional[int] = None,
    product_id: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user
    sales = session.query(Sale)
    if user_id:
        sales = sales.filter(Sale.user_id == user_id)
    if product_id:
        sales = sales.filter(Sale.product_id == product_id)
    return sales.all()


@router.get("/{id}", response_model=SalePublicSchema, status_code=status.HTTP_200_OK)
def get(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale = session.query(Sale).filter(Sale.id == id).first()
    if not current_user.is_admin and sale.user_id != current_user.id:
        raise exception_access_dained_for_user
    return sale


@router.post(
    "/create", response_model=SalePublicSchema, status_code=status.HTTP_201_CREATED
)
def create(
    sale: SaleCreateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin and sale.user_id != current_user.id:
        raise exception_access_dained_for_user
    sale_db = Sale(**sale.model_dump())
    session.add(sale_db)
    session.commit()
    session.refresh(sale_db)
    return sale_db


@router.put(
    "/update/{id}", response_model=SalePublicSchema, status_code=status.HTTP_200_OK
)
def update(
    id: int,
    sale: SaleUpdateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale_data = sale.model_dump()
    sale_db = session.query(Sale).filter(Sale.id == id).first()
    if not current_user.is_admin and sale_db.user_id != current_user.id:
        raise exception_access_dained_for_user
    for key, value in sale_data.items():
        if not value:
            raise exception_missing_content
        setattr(sale_db, key, value)
    session.commit()
    session.refresh(sale_db)
    return sale_db


@router.patch(
    "/update/{id}", response_model=SalePublicSchema, status_code=status.HTTP_200_OK
)
def update_partial(
    id: int,
    sale: SaleUpdatePartialSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale_data = sale.model_dump(exclude_unset=True)
    sale_db = session.query(Sale).filter(Sale.id == id).first()
    if not current_user.is_admin and sale_db.user_id != current_user.id:
        raise exception_access_dained_for_user
    for key, value in sale_data.items():
        setattr(sale_db, key, value)
    session.commit()
    session.refresh(sale_db)
    return sale_db


@router.delete("/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale_db = session.query(Sale).filter(Sale.id == id).first()
    if not current_user.is_admin and sale_db.user_id != current_user.id:
        raise exception_access_dained_for_user
    session.delete(sale_db)
    session.commit()
    return {"status": status.HTTP_204_NO_CONTENT, "message": "sucesso ao deletar venda"}
