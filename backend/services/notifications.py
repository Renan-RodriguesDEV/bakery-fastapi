from db.entities import Notification, User
from schemas.notification import NotificationCreateSchema
from services.websocket import manager
from sqlalchemy.orm import Session


async def create_notification(
    session: Session, notification_data: NotificationCreateSchema
) -> Notification:
    """Cria uma notificação no banco de dados"""
    notification = Notification(**notification_data.model_dump())
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


async def send_notification_realtime(
    session: Session, notification_data: NotificationCreateSchema
):
    """Cria notificação no banco e envia via WebSocket"""
    notification = await create_notification(session, notification_data)
    
    # Envia notificação em tempo real via WebSocket
    await manager.send_personal_message(
        {
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "related_id": notification.related_id,
            "created_at": notification.created_at.isoformat(),
        },
        notification.user_id,
    )
    
    return notification


async def notify_low_stock(session: Session, product_id: int, product_name: str, stock: int):
    """Notifica administradores sobre estoque baixo"""
    if stock > 1:
        return
    
    # Busca todos os administradores
    admins = session.query(User).filter(User.is_admin == True).all()
    
    for admin in admins:
        notification_data = NotificationCreateSchema(
            user_id=admin.id,
            type="stock",
            title="⚠️ Estoque Baixo",
            message=f"O produto '{product_name}' está com estoque baixo ({stock} unidade{'s' if stock != 1 else ''}).",
            related_id=product_id,
        )
        await send_notification_realtime(session, notification_data)


async def notify_payment_request(
    session: Session, user_id: int, username: str, sale_id: int, product_name: str, value: float
):
    """Notifica administradores sobre solicitação de pagamento"""
    # Busca todos os administradores
    admins = session.query(User).filter(User.is_admin == True).all()
    
    for admin in admins:
        notification_data = NotificationCreateSchema(
            user_id=admin.id,
            type="payment",
            title="💰 Nova Solicitação de Pagamento",
            message=f"Cliente '{username}' solicitou pagamento de R$ {value:.2f} para '{product_name}'.",
            related_id=sale_id,
        )
        await send_notification_realtime(session, notification_data)
