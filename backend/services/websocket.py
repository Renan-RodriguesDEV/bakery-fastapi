from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Mapeia user_id para um conjunto de conexões WebSocket ativas
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        """Envia mensagem para um usuário específico"""
        if user_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.add(connection)
            
            # Remove conexões que falharam
            for connection in disconnected:
                self.disconnect(connection, user_id)

    async def broadcast_to_admins(self, message: dict, admin_ids: list[int]):
        """Envia mensagem para todos os administradores"""
        for admin_id in admin_ids:
            await self.send_personal_message(message, admin_id)


# Instância global do gerenciador de conexões
manager = ConnectionManager()
