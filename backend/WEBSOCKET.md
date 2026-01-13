# 🔌 WebSocket - Guia de Implementação

Documentação completa sobre WebSocket no backend da Padaria FastAPI para notificações em tempo real e chat.

## 📋 Visão Geral

O backend agora suporta comunicação WebSocket bidirecional para:

- ✅ Notificações em tempo real para usuários específicos
- ✅ Sistema de chat com broadcast para todos os usuários conectados
- ✅ Gerenciamento de múltiplas conexões por usuário
- ✅ Mensagens estruturadas em JSON

## 🚀 Endpoints WebSocket

### 1. Notificações em Tempo Real

**Endpoint:** `ws://localhost:8000/ws/notifications/{user_id}`

Permite que um usuário se conecte e receba notificações personalizadas.

#### Exemplo de Conexão (JavaScript)

```javascript
// Conectar ao WebSocket
const userId = 1;
const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}`);

// Evento de conexão estabelecida
ws.onopen = () => {
    console.log('Conectado ao servidor de notificações');
};

// Receber mensagens do servidor
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Notificação recebida:', data);
    
    // Tratar diferentes tipos de mensagem
    switch(data.type) {
        case 'connection':
            console.log('Conexão confirmada:', data.message);
            break;
        case 'pong':
            console.log('Servidor respondeu ao ping');
            break;
        case 'echo':
            console.log('Echo:', data.message);
            break;
        case 'error':
            console.error('Erro:', data.message);
            break;
    }
};

// Enviar mensagem ping
ws.send(JSON.stringify({ type: 'ping' }));

// Enviar mensagem personalizada
ws.send(JSON.stringify({ 
    message: 'Olá, servidor!' 
}));

// Evento de erro
ws.onerror = (error) => {
    console.error('Erro no WebSocket:', error);
};

// Evento de desconexão
ws.onclose = () => {
    console.log('Desconectado do servidor');
};
```

#### Mensagens Recebidas

**Conexão Estabelecida:**
```json
{
    "type": "connection",
    "message": "Conectado ao servidor de notificações",
    "user_id": 1
}
```

**Resposta ao Ping:**
```json
{
    "type": "pong",
    "message": "pong"
}
```

**Echo de Mensagem:**
```json
{
    "type": "echo",
    "message": "Recebido: sua mensagem aqui"
}
```

**Erro:**
```json
{
    "type": "error",
    "message": "Formato de mensagem inválido"
}
```

### 2. Chat em Tempo Real

**Endpoint:** `ws://localhost:8000/ws/chat/{user_id}`

Permite broadcast de mensagens para todos os usuários conectados ao chat.

#### Exemplo de Conexão (JavaScript)

```javascript
const userId = 2;
const ws = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);

ws.onopen = () => {
    console.log('Conectado ao chat');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch(data.type) {
        case 'user_joined':
            console.log(`${data.user_id} entrou no chat`);
            break;
        case 'message':
            console.log(`${data.user_id}: ${data.content}`);
            // Exibir mensagem na interface
            displayMessage(data.user_id, data.content);
            break;
        case 'user_left':
            console.log(`${data.user_id} saiu do chat`);
            break;
    }
};

// Enviar mensagem no chat
function sendMessage(content) {
    ws.send(JSON.stringify({
        type: 'message',
        content: content
    }));
}

// Exemplo de uso
sendMessage('Olá, pessoal!');
```

#### Mensagens Recebidas

**Usuário Entrou:**
```json
{
    "type": "user_joined",
    "user_id": 2,
    "message": "Usuário 2 entrou no chat"
}
```

**Mensagem de Chat:**
```json
{
    "type": "message",
    "user_id": 2,
    "content": "Olá, pessoal!"
}
```

**Usuário Saiu:**
```json
{
    "type": "user_left",
    "user_id": 2,
    "message": "Usuário 2 saiu do chat"
}
```

## 🏗️ Arquitetura

### Connection Manager

O `ConnectionManager` gerencia todas as conexões WebSocket ativas:

```python
from services.websocket import manager

# Enviar mensagem para um usuário específico
await manager.send_personal_message(
    message='{"type": "notification", "content": "Nova venda!"}',
    user_id=1
)

# Broadcast para todos os usuários
await manager.broadcast(
    message='{"type": "announcement", "content": "Servidor será reiniciado"}'
)

# Broadcast apenas para administradores
admin_ids = [1, 2, 3]
await manager.broadcast_to_admins(
    message='{"type": "admin", "content": "Novo pedido pendente"}',
    admin_ids=admin_ids
)
```

### Estrutura de Arquivos

```
backend/
├── services/
│   └── websocket.py          # Connection Manager
├── routes/
│   └── websocket.py          # Endpoints WebSocket
└── app.py                    # Integração do router
```

## 🔧 Integração com Outras Funcionalidades

### Exemplo: Notificar Usuário Após Venda

```python
from services.websocket import manager

@router.post("/sales/create")
async def create_sale(sale: SaleCreateSchema, ...):
    # Criar venda
    new_sale = Sale(**sale.model_dump())
    session.add(new_sale)
    session.commit()
    
    # Notificar usuário via WebSocket
    await manager.send_personal_message(
        message=json.dumps({
            "type": "sale_completed",
            "sale_id": new_sale.id,
            "total": new_sale.total_price,
            "message": "Sua compra foi registrada com sucesso!"
        }),
        user_id=sale.user_id
    )
    
    return new_sale
```

### Exemplo: Notificar Admins sobre Novo Pedido

```python
@router.post("/cart/checkout")
async def checkout(user_id: int, session: Session = Depends(get_session)):
    # Processar checkout
    # ...
    
    # Buscar IDs de administradores
    admins = session.query(User).filter(User.is_admin == True).all()
    admin_ids = [admin.id for admin in admins]
    
    # Notificar todos os admins
    await manager.broadcast_to_admins(
        message=json.dumps({
            "type": "new_order",
            "user_id": user_id,
            "message": f"Novo pedido do usuário {user_id}"
        }),
        admin_ids=admin_ids
    )
```

## 🧪 Testando WebSocket

### 1. Usando o Script de Teste

```bash
# Com servidor rodando em http://localhost:8000
python test_websocket.py
```

### 2. Usando Ferramentas do Navegador

**Chrome DevTools:**
```javascript
// Abrir Console (F12)
const ws = new WebSocket('ws://localhost:8000/ws/notifications/1');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({type: 'ping'}));
```

### 3. Usando Extensões de Navegador

- **WebSocket King** (Chrome)
- **Simple WebSocket Client** (Chrome)
- **WebSocket Test Client** (Firefox)

### 4. Usando wscat (CLI)

```bash
# Instalar wscat
npm install -g wscat

# Conectar
wscat -c ws://localhost:8000/ws/notifications/1

# Enviar mensagem
> {"type": "ping"}

# Receber resposta
< {"type": "pong", "message": "pong"}
```

## 📱 Exemplo de Integração com Next.js

### Hook Personalizado

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

interface UseWebSocketProps {
    userId: number;
    endpoint: 'notifications' | 'chat';
}

export function useWebSocket({ userId, endpoint }: UseWebSocketProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(
            `ws://localhost:8000/ws/${endpoint}/${userId}`
        );

        ws.onopen = () => {
            console.log('WebSocket conectado');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        ws.onerror = (error) => {
            console.error('Erro no WebSocket:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket desconectado');
            setIsConnected(false);
        };

        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, [userId, endpoint]);

    const sendMessage = (message: any) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify(message));
        }
    };

    return { messages, isConnected, sendMessage };
}
```

### Componente de Notificações

```typescript
// components/Notifications.tsx
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export function Notifications({ userId }: { userId: number }) {
    const { messages, isConnected } = useWebSocket({
        userId,
        endpoint: 'notifications'
    });

    useEffect(() => {
        messages.forEach((msg) => {
            if (msg.type === 'sale_completed') {
                toast.success(msg.message);
            } else if (msg.type === 'notification') {
                toast.info(msg.content);
            }
        });
    }, [messages]);

    return (
        <div className="fixed top-4 right-4">
            <div className={`px-3 py-1 rounded ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white text-sm`}>
                {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </div>
        </div>
    );
}
```

### Componente de Chat

```typescript
// components/Chat.tsx
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { useState } from 'react';

export function Chat({ userId }: { userId: number }) {
    const { messages, isConnected, sendMessage } = useWebSocket({
        userId,
        endpoint: 'chat'
    });
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            sendMessage({ type: 'message', content: input });
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-96 border rounded">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className="mb-2">
                        {msg.type === 'message' && (
                            <div className={msg.user_id === userId ? 'text-right' : ''}>
                                <span className="font-bold">Usuário {msg.user_id}: </span>
                                <span>{msg.content}</span>
                            </div>
                        )}
                        {msg.type === 'user_joined' && (
                            <div className="text-gray-500 text-sm italic">
                                {msg.message}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-2 p-2 border-t">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 px-3 py-2 border rounded"
                    placeholder="Digite uma mensagem..."
                    disabled={!isConnected}
                />
                <button
                    onClick={handleSend}
                    disabled={!isConnected}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
```

## 🔒 Segurança e Boas Práticas

### 1. Validação de Usuário

Para produção, adicione validação de token JWT:

```python
from auth.auth import verify_token

@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(
    websocket: WebSocket,
    user_id: int,
    token: str = Query(...),  # Token via query parameter
):
    # Verificar token antes de aceitar conexão
    try:
        payload = verify_token(token)
        if payload.get("sub") != user_id:
            await websocket.close(code=4001, reason="Unauthorized")
            return
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    await manager.connect(websocket, user_id)
    # ...
```

Uso no frontend:
```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(
    `ws://localhost:8000/ws/notifications/${userId}?token=${token}`
);
```

### 2. Rate Limiting

Implemente rate limiting para prevenir abuso:

```python
from collections import defaultdict
import time

# Rastreador de mensagens por usuário
message_tracker = defaultdict(list)
MAX_MESSAGES_PER_MINUTE = 60

def check_rate_limit(user_id: int) -> bool:
    now = time.time()
    # Limpar mensagens antigas
    message_tracker[user_id] = [
        t for t in message_tracker[user_id] 
        if now - t < 60
    ]
    # Verificar limite
    if len(message_tracker[user_id]) >= MAX_MESSAGES_PER_MINUTE:
        return False
    message_tracker[user_id].append(now)
    return True
```

### 3. Tratamento de Erros

```python
try:
    while True:
        data = await websocket.receive_text()
        # Processar mensagem
except WebSocketDisconnect:
    manager.disconnect(websocket, user_id)
except Exception as e:
    logger.error(f"Erro no WebSocket: {e}")
    await websocket.close(code=1011, reason="Internal error")
```

### 4. Heartbeat/Keepalive

```javascript
// Cliente
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
    }
}, 30000); // A cada 30 segundos
```

## 🐛 Troubleshooting

### Erro: "Connection refused"

**Causa:** Servidor não está rodando  
**Solução:** Execute `uvicorn app:app --reload`

### Erro: "WebSocket connection failed"

**Causa:** Protocolo incorreto (https/wss vs http/ws)  
**Solução:** Use `ws://` para HTTP e `wss://` para HTTPS

### Erro: "Connection closed immediately"

**Causa:** Validação falhou ou erro no servidor  
**Solução:** Verifique logs do servidor e código de fechamento

### Mensagens não são recebidas

**Causa:** JSON inválido ou formato incorreto  
**Solução:** Use `JSON.stringify()` ao enviar e `JSON.parse()` ao receber

## 📚 Referências

- [FastAPI WebSocket Documentation](https://fastapi.tiangolo.com/advanced/websockets/)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [WebSocket Protocol (RFC 6455)](https://tools.ietf.org/html/rfc6455)

---

**Status:** Implementado e testado  
**Última atualização:** Janeiro 2026  
**Versão:** 1.0.0
