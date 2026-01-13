# Sistema de Notificações em Tempo Real

## 📋 Visão Geral

Este documento descreve o sistema de notificações em tempo real implementado para a aplicação Padaria FastAPI.

## ✨ Funcionalidades

### Notificações Implementadas

1. **Notificações de Estoque Baixo** (⚠️)
   - Acionadas automaticamente quando o estoque de um produto é <= 1
   - Enviadas apenas para administradores
   - Disparadas ao criar produto com estoque baixo
   - Disparadas ao atualizar produto para estoque baixo
   - Disparadas após uma venda que reduza o estoque para <= 1

2. **Notificações de Pagamento** (💰)
   - Acionadas quando um cliente realiza uma compra
   - Enviadas apenas para administradores
   - Inclui informações do cliente, produto e valor da compra

### Características do Sistema

- ✅ **Tempo Real**: WebSocket para entrega instantânea de notificações
- ✅ **Persistência**: Notificações armazenadas no banco de dados
- ✅ **Badge de Contador**: Indica número de notificações não lidas
- ✅ **Marcar como Lida**: Individual ou todas de uma vez
- ✅ **Deletar Notificações**: Remoção individual de notificações
- ✅ **UI Moderna**: Design similar ao Mercado Livre
- ✅ **Reconexão Automática**: WebSocket reconecta automaticamente se desconectado

## 🏗️ Arquitetura

### Backend (FastAPI)

```
backend/
├── db/
│   └── entities.py          # Modelo Notification
├── schemas/
│   └── notification.py      # Schemas Pydantic
├── services/
│   ├── websocket.py         # ConnectionManager para WebSocket
│   └── notifications.py     # Lógica de negócio das notificações
├── routes/
│   ├── notifications.py     # Endpoints REST e WebSocket
│   ├── products.py          # Integração com notificações de estoque
│   └── sales.py             # Integração com notificações de pagamento
└── migrations/
    └── versions/
        └── e502cb82e65e_add_notifications_table.py
```

### Frontend (Next.js)

```
frontend/
├── hooks/
│   └── useNotifications.ts  # Hook React para gerenciar notificações
├── components/
│   └── NotificationBell.tsx # Componente visual do sino de notificações
└── app/
    └── components/
        └── Sidebar.tsx       # Integração na barra lateral
```

## 🔌 API Endpoints

### REST Endpoints

| Método | Endpoint                          | Descrição                           |
|--------|-----------------------------------|-------------------------------------|
| GET    | `/notifications/all`              | Lista todas as notificações do usuário |
| GET    | `/notifications/unread/count`     | Retorna contagem de não lidas       |
| PATCH  | `/notifications/{id}/read`        | Marca uma notificação como lida     |
| PATCH  | `/notifications/mark-all-read`    | Marca todas como lidas              |
| DELETE | `/notifications/{id}`             | Deleta uma notificação              |

### WebSocket Endpoint

```
WS /notifications/ws/{user_id}
```

Conecta o usuário ao canal de notificações em tempo real. O servidor envia automaticamente novas notificações assim que são criadas.

## 📊 Modelo de Dados

### Notification Entity

```python
class Notification(Base):
    __tablename__ = "notificacoes"

    id: int                      # ID único
    user_id: int                 # ID do usuário destinatário
    type: str                    # "stock" ou "payment"
    title: str                   # Título da notificação
    message: str                 # Mensagem detalhada
    is_read: bool                # Status de leitura
    related_id: int | None       # ID do produto ou venda relacionada
    created_at: datetime         # Data/hora de criação
```

## 🚀 Como Usar

### Para Administradores

1. **Visualizar Notificações**
   - O sino de notificações aparece na barra lateral (apenas para admins)
   - Badge vermelho mostra o número de notificações não lidas
   - Clique no sino para abrir o painel de notificações

2. **Interagir com Notificações**
   - Clique em "Marcar como lida" para marcar individualmente
   - Clique em "Marcar todas como lidas" no topo do painel
   - Clique no "X" para deletar uma notificação

3. **Receber Notificações em Tempo Real**
   - Notificações aparecem instantaneamente quando:
     - Um cliente realiza uma compra
     - O estoque de um produto atinge 1 ou menos

### Para Desenvolvedores

#### Criar uma Notificação Manualmente

```python
from services.notifications import send_notification_realtime
from schemas.notification import NotificationCreateSchema

# Criar notificação
notification_data = NotificationCreateSchema(
    user_id=admin_id,
    type="payment",  # ou "stock"
    title="Título da Notificação",
    message="Mensagem detalhada",
    related_id=123  # opcional
)

await send_notification_realtime(session, notification_data)
```

#### Conectar ao WebSocket (JavaScript)

```javascript
const ws = new WebSocket(`ws://localhost:8000/notifications/ws/${userId}`);

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Nova notificação:', notification);
};

// Manter conexão viva
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send('ping');
  }
}, 30000);
```

## 🧪 Testando

### 1. Testar Notificação de Estoque Baixo

```bash
# Login como admin
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@bakery.com", "password": "admin123"}'

# Criar produto com estoque <= 1
curl -X POST http://localhost:8000/products/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pão Integral",
    "price": 3.50,
    "stock": 1,
    "category": "Pães",
    "validity": "2026-01-14T00:00:00"
  }'
```

### 2. Testar Notificação de Pagamento

```bash
# Login como cliente
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "cliente@bakery.com", "password": "cliente123"}'

# Criar venda (como cliente)
curl -X POST http://localhost:8000/sales/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": {client_id},
    "product_id": {product_id},
    "count": 2,
    "was_paid": false
  }'
```

### 3. Testar no Frontend

1. Abra `http://localhost:3000`
2. Faça login como admin (admin@bakery.com / admin123)
3. Observe o sino de notificações na barra lateral
4. Em outra aba, faça login como cliente e crie uma compra
5. Volte para a aba do admin e veja a notificação aparecer em tempo real

## 🔒 Segurança

- Notificações são visíveis apenas para o usuário destinatário
- WebSocket requer autenticação (user_id validado)
- Administradores recebem notificações de estoque e pagamento
- Clientes não têm acesso às notificações (por enquanto)

## 📝 Notas Técnicas

### Reconexão Automática do WebSocket

O hook `useNotifications` implementa reconexão automática com delay de 3 segundos:

```typescript
ws.onclose = () => {
  setTimeout(() => {
    connectWebSocket();
  }, 3000);
};
```

### Gestão de Múltiplas Conexões

O `ConnectionManager` suporta múltiplas conexões simultâneas do mesmo usuário (ex: múltiplas abas abertas):

```python
# Um usuário pode ter múltiplas conexões WebSocket ativas
self.active_connections: Dict[int, Set[WebSocket]] = {}
```

### Ping/Pong para Manter Conexão Viva

O cliente envia um "ping" a cada 30 segundos para evitar timeout:

```typescript
const pingInterval = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send('ping');
  }
}, 30000);
```

## 🐛 Troubleshooting

### Notificações não aparecem

1. Verifique se o WebSocket está conectado (console do navegador)
2. Confirme que o usuário é administrador
3. Verifique os logs do backend para erros

### WebSocket desconecta constantemente

1. Verifique sua conexão de internet
2. Confirme que o backend está rodando
3. Verifique se há firewall bloqueando WebSocket

### Contador de não lidas incorreto

1. Limpe o cache do navegador
2. Faça logout e login novamente
3. Verifique o banco de dados diretamente

## 🚀 Próximas Melhorias

- [ ] Notificações para clientes (ex: "Seu pedido foi aprovado")
- [ ] Sons de notificação
- [ ] Notificações push (navegador)
- [ ] Filtros por tipo de notificação
- [ ] Paginação para muitas notificações
- [ ] Notificações por email
- [ ] Preferências de notificação por usuário

## 📄 Licença

MIT
