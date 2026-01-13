from auth.auth import get_current_user
from db.connection import get_session
from db.entities import Notification, User
from exceptions.handle_exceptions import exception_access_dained_for_user
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from schemas.notification import NotificationPublicSchema, NotificationUpdateSchema
from services.websocket import manager
from sqlalchemy.orm import Session

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """Endpoint WebSocket para receber notificações em tempo real"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Mantém a conexão aberta e aguarda mensagens (ping/pong)
            data = await websocket.receive_text()
            # Echo para manter conexão viva
            await websocket.send_text(f"pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


@router.get("/all", response_model=list[NotificationPublicSchema], status_code=status.HTTP_200_OK)
async def get_all_notifications(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Retorna todas as notificações do usuário atual"""
    notifications = (
        session.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return notifications


@router.get("/unread/count", status_code=status.HTTP_200_OK)
async def get_unread_count(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Retorna a contagem de notificações não lidas"""
    count = (
        session.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .count()
    )
    return {"count": count}


@router.patch("/{notification_id}/read", response_model=NotificationPublicSchema, status_code=status.HTTP_200_OK)
async def mark_as_read(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Marca uma notificação como lida"""
    notification = session.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        from exceptions.handle_exceptions import exception_missing_content
        raise exception_missing_content
    
    if notification.user_id != current_user.id:
        raise exception_access_dained_for_user
    
    notification.is_read = True
    session.commit()
    session.refresh(notification)
    return notification


@router.patch("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_as_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Marca todas as notificações do usuário como lidas"""
    session.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    session.commit()
    return {"message": "Todas as notificações foram marcadas como lidas"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Deleta uma notificação"""
    notification = session.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        from exceptions.handle_exceptions import exception_missing_content
        raise exception_missing_content
    
    if notification.user_id != current_user.id:
        raise exception_access_dained_for_user
    
    session.delete(notification)
    session.commit()
    return {"message": "Notificação deletada com sucesso"}
