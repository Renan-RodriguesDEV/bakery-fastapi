from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    """
    Gerenciador de conexões WebSocket.
    Mantém controle de todas as conexões ativas e permite enviar mensagens.
    """

    def __init__(self):
        # Dicionário de conexões ativas: {user_id: [websocket1, websocket2, ...]}
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """
        Aceita e registra uma nova conexão WebSocket para um usuário.
        """
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        """
        Remove uma conexão WebSocket do gerenciador.
        """
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        """
        Envia uma mensagem para todas as conexões de um usuário específico.
        """
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

    async def broadcast(self, message: str):
        """
        Envia uma mensagem para todos os usuários conectados.
        """
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                await connection.send_text(message)

    async def broadcast_to_admins(self, message: str, admin_ids: List[int]):
        """
        Envia uma mensagem para todos os administradores conectados.
        """
        for admin_id in admin_ids:
            if admin_id in self.active_connections:
                for connection in self.active_connections[admin_id]:
                    await connection.send_text(message)


# Instância global do gerenciador de conexões
manager = ConnectionManager()
