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
            try:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            except ValueError:
                # Websocket já foi removido
                pass

    async def send_personal_message(self, message: str, user_id: int):
        """
        Envia uma mensagem para todas as conexões de um usuário específico.
        """
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    # Marcar conexão para remoção se falhar
                    disconnected.append(connection)
            
            # Remover conexões quebradas
            for connection in disconnected:
                self.disconnect(connection, user_id)

    async def broadcast(self, message: str):
        """
        Envia uma mensagem para todos os usuários conectados.
        """
        for user_id, user_connections in list(self.active_connections.items()):
            disconnected = []
            for connection in user_connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    # Marcar conexão para remoção se falhar
                    disconnected.append(connection)
            
            # Remover conexões quebradas
            for connection in disconnected:
                self.disconnect(connection, user_id)

    async def broadcast_to_admins(self, message: str, admin_ids: List[int]):
        """
        Envia uma mensagem para todos os administradores conectados.
        """
        for admin_id in admin_ids:
            if admin_id in self.active_connections:
                disconnected = []
                for connection in self.active_connections[admin_id]:
                    try:
                        await connection.send_text(message)
                    except Exception:
                        # Marcar conexão para remoção se falhar
                        disconnected.append(connection)
                
                # Remover conexões quebradas
                for connection in disconnected:
                    self.disconnect(connection, admin_id)


# Instância global do gerenciador de conexões
manager = ConnectionManager()
