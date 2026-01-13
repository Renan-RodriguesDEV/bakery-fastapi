from typing import Optional

from auth.auth import get_current_user
from db.connection import get_session
from db.entities import Product, Sale, User
from exceptions.handle_exceptions import (
    exception_access_dained_for_user,
    exception_missing_content,
    exception_sale_not_found,
)
from fastapi import APIRouter, Depends, status
from schemas.sale import (
    SaleCreateSchema,
    SalePublicSchema,
    SaleUpdatePartialSchema,
    SaleUpdateSchema,
)
from services.notifications import notify_low_stock, notify_payment_request
from services.sales import calculate_stock, calculate_value
from sqlalchemy.orm import Session

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get(
    "/all", response_model=list[SalePublicSchema], status_code=status.HTTP_200_OK
)
async def get_all(
    user_id: Optional[int] = None,
    product_id: Optional[int] = None,
    was_paid: Optional[bool] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin and current_user.id != user_id:
        raise exception_access_dained_for_user
    sales = session.query(Sale)
    if user_id:
        sales = sales.filter(Sale.user_id == user_id)
    if product_id:
        sales = sales.filter(Sale.product_id == product_id)
    if was_paid:
        sales = sales.filter(Sale.was_paid == was_paid)
    return sales.all()


@router.get("/{id}", response_model=SalePublicSchema, status_code=status.HTTP_200_OK)
async def get(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale = session.query(Sale).filter(Sale.id == id).first()
    if not current_user.is_admin and sale.user_id != current_user.id:
        raise exception_access_dained_for_user
    if not sale:
        raise exception_sale_not_found
    return sale


@router.post(
    "/create", response_model=SalePublicSchema, status_code=status.HTTP_201_CREATED
)
async def create(
    sale: SaleCreateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin and sale.user_id != current_user.id:
        raise exception_access_dained_for_user

    product = session.query(Product).filter(Product.id == sale.product_id).first()
    sale_db = Sale(**sale.model_dump())
    sale_db.value = calculate_value(sale.count, product.price)
    product.stock = calculate_stock(sale.count, product.stock)
    session.add(sale_db)
    session.commit()
    session.refresh(sale_db)
    
    # Notifica sobre estoque baixo se necessário
    if product.stock <= 1:
        await notify_low_stock(session, product.id, product.name, product.stock)
    
    # Envia notificação de pagamento para administradores
    await notify_payment_request(
        session=session,
        user_id=current_user.id,
        username=current_user.username,
        sale_id=sale_db.id,
        product_name=product.name,
        value=sale_db.value,
    )
    
    return sale_db


@router.put(
    "/update/{id}", response_model=SalePublicSchema, status_code=status.HTTP_200_OK
)
async def update(
    id: int,
    sale: SaleUpdateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale_data = sale.model_dump()
    sale_db = session.query(Sale).filter(Sale.id == id).first()
    if not sale_db:
        raise exception_sale_not_found
    product = session.query(Product).filter(Product.id == sale_db.product_id).first()
    sale_db.value = calculate_value(sale.count, product.price)
    # calcula a diferença entre o estoque atual e a quantidade vendida
    # Exemplo rápido
    # Estoque atual: 100
    # Quantidade antiga: 3
    # Quantidade nova: 5
    # diferença = 5 − 3 = 2
    # estoque = 100 − 2 = 98
    diff = sale.count - sale_db.count
    product.stock = calculate_stock(diff, product.stock)

    if not current_user.is_admin and sale_db.user_id != current_user.id:
        raise exception_access_dained_for_user
    for key, value in sale_data.items():
        if not value and key != "was_paid":
            raise exception_missing_content
        setattr(sale_db, key, value)
    session.commit()
    session.refresh(sale_db)
    return sale_db


@router.patch(
    "/update/{id}", response_model=SalePublicSchema, status_code=status.HTTP_200_OK
)
async def update_partial(
    id: int,
    sale: SaleUpdatePartialSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale_data = sale.model_dump(exclude_unset=True)
    sale_db = session.query(Sale).filter(Sale.id == id).first()
    if not sale_db:
        raise exception_sale_not_found
    if not current_user.is_admin and sale_db.user_id != current_user.id:
        raise exception_access_dained_for_user
    for key, value in sale_data.items():
        if key == "count":
            product = (
                session.query(Product).filter(Product.id == sale_db.product_id).first()
            )
            diff = sale.count - sale_db.count
            product.stock = calculate_stock(diff, product.stock)
        setattr(sale_db, key, value)
    session.commit()
    session.refresh(sale_db)
    return sale_db


@router.delete("/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale = session.query(Sale).filter(Sale.id == id).first()
    if not sale:
        raise exception_sale_not_found
    if not current_user.is_admin and sale.user_id != current_user.id:
        raise exception_access_dained_for_user
    session.delete(sale)
    session.commit()
    return {"status": status.HTTP_204_NO_CONTENT, "message": "sucesso ao deletar venda"}
