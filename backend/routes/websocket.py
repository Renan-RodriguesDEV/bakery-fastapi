import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.websocket import manager

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/notifications/{user_id}")
async def websocket_notifications(
    websocket: WebSocket,
    user_id: int,
):
    """
    Endpoint WebSocket para notificações em tempo real.
    Permite que clientes se conectem e recebam notificações.

    Exemplo de uso no frontend:
    ```javascript
    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}`);

    ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        console.log('Nova notificação:', notification);
    };

    ws.send(JSON.stringify({ type: 'ping' }));
    ```
    """
    await manager.connect(websocket, user_id)
    try:
        # Envia mensagem de boas-vindas
        await websocket.send_text(
            json.dumps(
                {
                    "type": "connection",
                    "message": "Conectado ao servidor de notificações",
                    "user_id": user_id,
                }
            )
        )

        # Loop para receber mensagens do cliente
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)

                # Echo de mensagens de ping
                if message_data.get("type") == "ping":
                    await websocket.send_text(
                        json.dumps({"type": "pong", "message": "pong"})
                    )
                else:
                    # Echo da mensagem recebida
                    await manager.send_personal_message(
                        json.dumps(
                            {
                                "type": "echo",
                                "message": f"Recebido: {message_data.get('message', '')}",
                            }
                        ),
                        user_id,
                    )
            except json.JSONDecodeError:
                # Se não for JSON válido, envia mensagem de erro
                try:
                    await websocket.send_text(
                        json.dumps(
                            {"type": "error", "message": "Formato de mensagem inválido"}
                        )
                    )
                except Exception:
                    # Conexão pode estar quebrada, interromper loop
                    break

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


@router.websocket("/chat/{user_id}")
async def websocket_chat(
    websocket: WebSocket,
    user_id: int,
):
    """
    Endpoint WebSocket para chat em tempo real.
    Permite broadcast de mensagens para todos os usuários conectados.

    Exemplo de uso no frontend:
    ```javascript
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Nova mensagem:', message);
    };

    ws.send(JSON.stringify({
        type: 'message',
        content: 'Olá!'
    }));
    ```
    """
    await manager.connect(websocket, user_id)
    try:
        # Notifica todos sobre nova conexão
        await manager.broadcast(
            json.dumps(
                {
                    "type": "user_joined",
                    "user_id": user_id,
                    "message": f"Usuário {user_id} entrou no chat",
                }
            )
        )

        # Loop para receber e transmitir mensagens
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)

                # Broadcast da mensagem para todos
                await manager.broadcast(
                    json.dumps(
                        {
                            "type": "message",
                            "user_id": user_id,
                            "content": message_data.get("content", ""),
                        }
                    )
                )
            except json.JSONDecodeError:
                try:
                    await websocket.send_text(
                        json.dumps(
                            {"type": "error", "message": "Formato de mensagem inválido"}
                        )
                    )
                except Exception:
                    # Conexão pode estar quebrada, interromper loop
                    break

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        # Notifica todos sobre desconexão
        await manager.broadcast(
            json.dumps(
                {
                    "type": "user_left",
                    "user_id": user_id,
                    "message": f"Usuário {user_id} saiu do chat",
                }
            )
        )
