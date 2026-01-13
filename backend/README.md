# 🍞 Backend - FastAPI Padaria

Servidor de API REST assíncrono built com FastAPI, SQLAlchemy e JWT. Fornece autenticação, gerencimento de produtos, carrinho, vendas e controle de acesso.

## 📋 Visão Geral

API completa para gerenciar a padaria com:

- ✅ Autenticação OAuth2/JWT com Bcrypt
- ✅ 25+ endpoints REST
- ✅ CRUD para Users, Products, Cart, Sales
- ✅ Dois tipos de usuários (Cliente e Admin)
- ✅ Migrações automáticas com Alembic
- ✅ Envio de emails SMTP
- ✅ Documentação interativa Swagger/ReDoc
- ✅ WebSocket para notificações em tempo real e chat

## 🚀 Quick Start

### Pré-requisitos

- Python 3.11+
- PostgreSQL (ou SQLite para dev)

### Instalação

```bash
# Crie ambiente virtual
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate # macOS/Linux

# Instale dependências
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edite .env com suas credenciais

# Execute migrações
alembic upgrade head

# Inicie servidor
uvicorn app:app --reload
```

Backend rodando em `http://localhost:8000`

### Acessar Documentação

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 📁 Estrutura de Diretórios

```
backend/
├── app.py                      # Aplicação FastAPI principal
├── requirements.txt            # Dependências Python
├── alembic.ini                # Configuração de migrações
├── .env                       # Variáveis de ambiente
├── .env.example               # Template de .env
│
├── auth/
│   └── auth.py               # Autenticação JWT/OAuth2
│
├── config/
│   └── config.py             # Carregamento de variáveis
│
├── db/
│   ├── base.py               # Base para ORM
│   ├── connection.py         # Conexão com banco
│   └── entities.py           # Modelos SQLAlchemy
│
├── routes/
│   ├── auth.py               # Endpoints /auth
│   ├── users.py              # Endpoints /users
│   ├── products.py           # Endpoints /products
│   ├── cart.py               # Endpoints /cart
│   ├── sales.py              # Endpoints /sales
│   └── websocket.py          # Endpoints /ws (WebSocket)
│
├── schemas/
│   ├── user.py               # Validação User
│   ├── product.py            # Validação Product
│   ├── cart.py               # Validação Cart
│   ├── sale.py               # Validação Sale
│   └── token.py              # Validação Token
│
├── services/
│   ├── email.py              # Envio SMTP
│   ├── token.py              # Gerenciamento JWT
│   ├── sales.py              # Lógica vendas
│   └── websocket.py          # Gerenciador de conexões WebSocket
│
├── exceptions/
│   └── handle_exceptions.py  # Tratamento erros
│
└── migrations/
    ├── env.py
    ├── script.py.mako
    └── versions/
        ├── 427d0a9f8ee8_initial_migration.py
        └── ee2e381f5e40_.py
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```ini
# Banco de Dados
DB_URL=postgresql+psycopg2://user:password@localhost:5432/padaria

# Autenticação
SECRET_KEY=sua-chave-secreta-aqui-min-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_TIME=4320  # minutos (3 dias)

# Debug
DEBUG=TRUE

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app  # Use App Passwords no Gmail
SMTP_FROM=seu-email@gmail.com
```

### Para Gmail

1. Ative 2FA na conta Google
2. Gere **App Password** em https://myaccount.google.com/apppasswords
3. Use a senha gerada em `SMTP_PASSWORD`

## 📚 Endpoints

### Autenticação (`/auth`)

| Método | Rota                    | Descrição             | Auth |
| ------ | ----------------------- | --------------------- | ---- |
| POST   | `/auth/login`           | Login com credenciais | ❌   |
| POST   | `/auth/forgot-password` | Solicitar reset       | ❌   |
| POST   | `/auth/reset-password`  | Confirmar reset       | ❌   |

### Usuários (`/users`)

| Método | Rota            | Descrição     | Auth | Permissão     |
| ------ | --------------- | ------------- | ---- | ------------- |
| GET    | `/users/me`     | Dados atuais  | ✅   | Próprio       |
| GET    | `/users/all`    | Listar todos  | ✅   | Admin         |
| GET    | `/users/{id}`   | Detalhes      | ✅   | Admin/Próprio |
| POST   | `/users/create` | Criar usuário | ❌   | -             |
| PATCH  | `/users/{id}`   | Atualizar     | ✅   | Admin/Próprio |
| DELETE | `/users/{id}`   | Deletar       | ✅   | Admin/Próprio |

### Produtos (`/products`)

| Método | Rota               | Descrição       | Auth | Permissão |
| ------ | ------------------ | --------------- | ---- | --------- |
| GET    | `/products/all`    | Listar produtos | ✅   | Cliente   |
| GET    | `/products/{id}`   | Detalhes        | ✅   | Cliente   |
| POST   | `/products/create` | Criar           | ✅   | Admin     |
| PUT    | `/products/{id}`   | Atualizar       | ✅   | Admin     |
| DELETE | `/products/{id}`   | Deletar         | ✅   | Admin     |

### Carrinho (`/cart`)

| Método | Rota           | Descrição    | Auth | Permissão |
| ------ | -------------- | ------------ | ---- | --------- |
| GET    | `/cart/all`    | Listar items | ✅   | Cliente   |
| POST   | `/cart/create` | Adicionar    | ✅   | Cliente   |
| PUT    | `/cart/{id}`   | Atualizar    | ✅   | Cliente   |
| DELETE | `/cart/{id}`   | Remover      | ✅   | Cliente   |

### Vendas (`/sales`)

| Método | Rota            | Descrição     | Auth | Permissão     |
| ------ | --------------- | ------------- | ---- | ------------- |
| GET    | `/sales/all`    | Listar vendas | ✅   | Cliente/Admin |
| POST   | `/sales/create` | Registrar     | ✅   | Cliente       |
| PUT    | `/sales/{id}`   | Atualizar     | ✅   | Admin         |

### WebSocket (`/ws`)

| Endpoint                    | Descrição                      | Auth | Permissão |
| --------------------------- | ------------------------------ | ---- | --------- |
| `/ws/notifications/{id}`    | Notificações em tempo real     | ⚠️   | Próprio   |
| `/ws/chat/{id}`             | Chat com broadcast             | ⚠️   | Qualquer  |

⚠️ = Recomenda-se adicionar autenticação JWT via query parameter em produção.

Ver [WEBSOCKET.md](WEBSOCKET.md) para documentação completa.

## 🔐 Autenticação

### Fluxo OAuth2/JWT

```
1. POST /auth/login {username, password}
   ↓
2. Backend valida credenciais (bcrypt)
   ├─ Sucesso → Gera JWT access_token
   └─ Falha → 401 Unauthorized
   ↓
3. Cliente recebe:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
   ↓
4. Cliente armazena token
   ↓
5. Próximas requisições:
   Authorization: Bearer {access_token}
```

### Usar Token em Requisições

```python
import requests

token = "seu-access-token-aqui"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.get(
    "http://localhost:8000/users/me",
    headers=headers
)
print(response.json())
```

### Dependência de Autenticação

```python
from auth.auth import get_current_user

@app.get("/users/me")
async def get_current_user_data(current_user = Depends(get_current_user)):
    return current_user
```

## 📝 Modelos de Dados

### User

```python
class User(Base):
    id: int                      # Primary Key
    name: str                    # Nome completo
    username: str                # Email (único)
    password: str                # Hash bcrypt
    telephone: str | None        # Telefone
    is_admin: bool = False       # Cliente ou Admin
    created_at: datetime         # Data criação
```

### Product

```python
class Product(Base):
    id: int                      # Primary Key
    name: str                    # Nome
    description: str | None      # Descrição
    price: float                 # Preço
    stock: int = 0               # Estoque
    category: str | None         # Categoria
    image_url: str | None        # URL da imagem
    created_at: datetime         # Data criação
```

### Cart

```python
class Cart(Base):
    id: int                      # Primary Key
    user_id: int                 # FK User
    product_id: int              # FK Product
    quantity: int = 1            # Quantidade
    created_at: datetime         # Data criação
```

### Sale

```python
class Sale(Base):
    id: int                      # Primary Key
    user_id: int                 # FK User
    product_id: int              # FK Product
    quantity: int                # Quantidade vendida
    total_price: float           # Preço total
    payment_status: str          # pending, paid, cancelled
    created_at: datetime         # Data venda
```

## 🗄️ Banco de Dados

### Usar PostgreSQL (Produção)

```ini
DB_URL=postgresql+psycopg2://user:password@localhost:5432/padaria
```

Instale o driver:

```bash
pip install psycopg2-binary
```

Crie o banco:

```bash
createdb padaria
```

### Usar SQLite (Desenvolvimento)

```ini
DB_URL=sqlite:///./test.db
```

Nenhuma instalação extra necessária!

## 🔄 Migrações

Usar Alembic para versionamento do schema.

### Criar Migração

```bash
# Automática (recomendado)
alembic revision --autogenerate -m "Add telefone to users"

# Manual
alembic revision -m "Custom migration"
```

### Aplicar Migrações

```bash
# Aplicar todas as pending
alembic upgrade head

# Ver status
alembic current
alembic history
```

Ver [backend/migrations/README.md](migrations/README) para guia completo.

## 📧 Envio de Emails

Usar `SenderMail` de `services/email.py`:

```python
from services.email import SenderMail

mailer = SenderMail()

# Enviar simples
await mailer.send(
    to_email="user@example.com",
    subject="Bem-vindo!",
    body="Olá, bem-vindo!"
)

# Enviar HTML
await mailer.send(
    to_email="user@example.com",
    subject="Reset Password",
    body="<h1>Clique aqui para resetar: <a href='...'>link</a></h1>",
    is_html=True
)
```

## 🧪 Testando a API

### Usando Swagger (Recomendado)

1. Acesse http://localhost:8000/docs
2. Clique em "Authorize"
3. Faça login
4. Use qualquer endpoint

### Usando cURL

```bash
# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"senha123"}'

# Usar token
TOKEN="seu-token-aqui"
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Usando Python

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/auth/login",
    json={"username": "user@example.com", "password": "senha123"}
)
token = response.json()["access_token"]

# Usar token
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(
    "http://localhost:8000/users/me",
    headers=headers
)
print(response.json())
```

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'fastapi'"

```bash
pip install -r requirements.txt
```

### "Connection refused: localhost:5432"

PostgreSQL não está rodando:

```bash
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

Ou use SQLite em desenvolvimento:

```ini
DB_URL=sqlite:///./test.db
```

### "Invalid token" ou "Unauthorized"

1. Certifique-se de que token está no header:

   ```
   Authorization: Bearer {token}
   ```

2. Token pode ter expirado. Faça login novamente

3. Verifique `SECRET_KEY` em `.env`

### "Table doesn't exist"

Execute migrações:

```bash
alembic upgrade head
```

### CORS Error

Middleware já está configurado em `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos (desenvolvimento)
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
```

Em produção, restrinja `allow_origins` para apenas seu domínio.

## 🔑 Criar Usuário Admin de Teste

### Opção 1: Via API (Swagger)

1. Acesse http://localhost:8000/docs
2. POST `/users/create` com `is_admin=true`

### Opção 2: Direto no Banco

PostgreSQL:

```sql
UPDATE users SET is_admin=true WHERE id=1;
```

SQLite:

```sql
UPDATE users SET is_admin=1 WHERE id=1;
```

## 📊 Estrutura de Resposta

### Sucesso

```json
{
  "id": 1,
  "name": "João Silva",
  "username": "joao@example.com",
  "is_admin": false,
  "created_at": "2026-01-12T10:00:00"
}
```

### Erro

```json
{
  "detail": "Credenciais inválidas"
}
```

Status HTTP apropriado:

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🚀 Deploy

### Preparar para Produção

1. Defina `DEBUG=FALSE` em `.env`
2. Use senha forte em `SECRET_KEY`
3. Configure `allow_origins` do CORS
4. Use PostgreSQL ao invés de SQLite
5. Use variáveis de ambiente seguras
6. Configure SSL/HTTPS

### Deploy em Heroku

```bash
# Crie Procfile
echo "web: uvicorn app:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
git push heroku main
```

### Deploy em AWS/DigitalOcean

Use containers Docker:

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📖 Referências

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/orm/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
- [JWT.io](https://jwt.io/)
- [Pydantic](https://docs.pydantic.dev/)

## 📝 Stack Técnico

| Componente    | Versão | Uso            |
| ------------- | ------ | -------------- |
| FastAPI       | 0.109+ | Framework Web  |
| SQLAlchemy    | 2.0+   | ORM            |
| Alembic       | 1.13+  | Migrações      |
| Pydantic      | 2.0+   | Validação      |
| PyJWT         | 2.8+   | Tokens JWT     |
| Bcrypt        | 4.1+   | Hash de Senhas |
| Python-dotenv | 1.0+   | Variáveis Env  |

---

**Status:** Em desenvolvimento ativo  
**Última atualização:** Janeiro 2026  
**Versão:** 0.0.1
