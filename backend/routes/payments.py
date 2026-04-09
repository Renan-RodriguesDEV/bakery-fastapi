import os

from auth.auth import get_current_user
from db.connection import get_session
from db.entities import Sale, User
from exceptions.handle_exceptions import (
    exception_access_dained_for_user,
    exception_not_payment,
    exception_runnable,
    exception_sale_not_found,
)
from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import RedirectResponse
from logger import logger
from schemas.payment import PaymentSchema
from services.email import SenderMail
from services.payment_manager import PaymentManager
from sqlalchemy.orm import Session

router = APIRouter(prefix="/payments", tags=["payments"])
payment_manager = PaymentManager()


@router.post("/{sale_id}", status_code=status.HTTP_201_CREATED)
def create(
    sale_id: int,
    payment: PaymentSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    sale = session.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise exception_sale_not_found
    if sale.user_id != current_user.id and not current_user.is_admin:
        raise exception_access_dained_for_user
    try:
        payment_response = payment_manager.create_preference(
            payment.title,
            payment.quantity,
            payment.unit_price,
        )
    except Exception as e:
        raise exception_runnable(e)
    if not payment_response:
        raise exception_not_payment
    sale.payment_id = payment_response.get("id")
    session.commit()
    return {
        "status": status.HTTP_201_CREATED,
        "data": {
            "info": payment.model_dump(),
            "payment": payment_response,
        },
    }


@router.get("/success", status_code=status.HTTP_200_OK)
def success(request: Request, session: Session = Depends(get_session)):
    logger.info(f"Pagamento aprovado {request.query_params}")
    preference_id = request.query_params.get("preference_id")
    if not preference_id:
        raise exception_not_payment
    sale = session.query(Sale).filter(Sale.payment_id == preference_id).first()
    if not sale:
        raise exception_sale_not_found
    sale.was_paid = True
    session.commit()
    return RedirectResponse(
        url=f"{os.getenv('FRONTEND_URL')}/sales",
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )


@router.get("/failure", status_code=status.HTTP_200_OK)
def failure(request: Request):
    logger.error(f"Pagamento falhou {request.query_params}")
    return RedirectResponse(
        url=f"{os.getenv('FRONTEND_URL')}/sales",
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )


@router.get("/pending", status_code=status.HTTP_200_OK)
def pending(request: Request):
    logger.warning(f"Pagamento pendente {request.query_params}")
    return RedirectResponse(
        url=f"{os.getenv('FRONTEND_URL')}/sales",
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )


@router.post("/i-go-get/{sale_id}", status_code=status.HTTP_200_OK)
def i_go_get(sale_id: int, session: Session = Depends(get_session)):
    sale = session.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        return exception_sale_not_found
    admins = session.query(User).filter(User.is_admin == True).all()
    logger.info(
        f"User {sale.user.name} is going to get the product {sale.product.name}"
    )
    sender_mail = SenderMail()
    for admin in admins:
        logger.info(f"Sending email to admin {admin.name} about the sale {sale.id}")
        sender_mail.async_send(
            admin.username,
            f"""Olá {admin.name},

O cliente {sale.user.name} solicitou a retirada do seguinte produto:

Produto: {sale.product.name}
Quantidade: {sale.count}
Valor unitário: R$ {sale.product.price:.2f}
Valor total: R$ {sale.value:.2f}

Por favor, prepare o item para retirada.

Em caso de dúvidas, fique à vontade para entrar em contato.

Atenciosamente,
Padaria da Vila
            """,
            "Notificação de retirada de produto",
        )
    return {"message": "Notificação enviada para os administradores."}
