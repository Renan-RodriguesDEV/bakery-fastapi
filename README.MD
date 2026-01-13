# 🍞 Padaria FastAPI - Sistema Completo de E-commerce

Uma plataforma full-stack moderna para gerenciar uma padaria virtual, com frontend responsivo em Next.js, backend robusto em FastAPI, autenticação JWT segura e dashboard dinâmico para clientes e administradores.

## 📋 Visão Geral

O projeto oferece uma solução completa de e-commerce com:

- ✅ **Autenticação JWT** com OAuth2 e controle de acesso por tipo de usuário
- ✅ **Dashboard dinâmico** que se adapta entre cliente e administrador
- ✅ **API REST assíncrona** com 25+ endpoints documentados
- ✅ **Gerencimento de estoque** com controle de produtos
- ✅ **Carrinho de compras** com cálculo automático de totais
- ✅ **Histórico de vendas** com filtros e relatórios
- ✅ **Envio de emails** para recuperação de senha
- ✅ **Migrações automáticas** com Alembic para versionamento de schema
- ✅ **Interface moderna** com Tailwind CSS e suporte a modo dark
- ✅ **WebSocket** para notificações em tempo real e chat
- ✅ **Documentação completa** com 6+ guias detalhados

## 🚀 Quick Start

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL (ou SQLite para desenvolvimento)

### Setup Rápido

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app:app --reload

# Frontend (novo terminal)
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000` para começar!

## 📊 Funcionalidades Implementadas

### ✅ 100% Completo

| Funcionalidade     | Status | Detalhes                              |
| ------------------ | ------ | ------------------------------------- |
| Autenticação JWT   | ✅     | Login, registro, recuperação de senha |
| Dashboard Dinâmico | ✅     | Adaptável para cliente e admin        |
| Proteção de Rotas  | ✅     | Middleware automático + componentes   |
| Controle de Acesso | ✅     | Cliente vs Administrador              |
| API REST           | ✅     | 25+ endpoints documentados            |
| Banco de Dados     | ✅     | SQLAlchemy ORM + Alembic              |
| Envio de Emails    | ✅     | SMTP com templates HTML               |
| WebSocket          | ✅     | Notificações e chat em tempo real     |
| Interface          | ✅     | Responsiva com Tailwind CSS           |

### 🟡 Estrutura Pronta (Faltam Integrações)

| Funcionalidade | Status | Próximo Passo                  |
| -------------- | ------ | ------------------------------ |
| Produtos       | 30%    | Implementar CRUD completo      |
| Carrinho       | 20%    | Integrar com frontend          |
| Vendas         | 20%    | Adicionar filtros e relatórios |
| Usuários       | 10%    | Gerenciamento admin            |

## 👥 Dois Tipos de Usuários

### 👤 Cliente

**Dashboard com:**

- 🛍️ Catálogo de produtos
- 🛒 Carrinho de compras
- 📋 Histórico de compras pessoais

**Permissões:**

- ✅ Ver produtos
- ✅ Adicionar ao carrinho
- ✅ Realizar compras
- ❌ Não pode gerenciar

### 👑 Administrador

**Dashboard com:**

- 📦 Gerenciar produtos (CRUD)
- 👥 Gerenciar usuários
- 💰 Histórico de todas as vendas

**Permissões:**

- ✅ Criar/editar/deletar produtos
- ✅ Gerenciar usuários
- ✅ Ver todas as vendas
- ❌ Não pode realizar compras

## 🏗️ Arquitetura

### Backend - FastAPI

```
backend/
├── app.py                 # Aplicação principal
├── auth/                  # Autenticação JWT/OAuth2
├── db/                    # Modelos SQLAlchemy
├── routes/                # Endpoints (auth, users, products, sales, cart)
├── schemas/               # Validação Pydantic v2
├── services/              # Lógica de negócio (email, token)
├── exceptions/            # Tratamento de erros
└── migrations/            # Alembic para versionamento
```

### Frontend - Next.js

```
frontend/
├── app/                   # Páginas (routing)
│   ├── login/            # Autenticação
│   ├── register/         # Novo usuário
│   ├── products/         # Catálogo
│   ├── carts/            # Carrinho
│   ├── sales/            # Histórico
│   └── users/            # Gerenciar (admin)
├── components/            # Componentes reutilizáveis
├── hooks/                 # useAuth() principal
├── lib/api/              # Módulos de API
└── middleware.ts         # Proteção de rotas
```

## 🔐 Autenticação

### Fluxo de Login

```
1. Usuário insere credenciais em /login
2. POST /auth/login → Backend valida
3. Backend retorna JWT access_token + refresh_token
4. Frontend armazena em localStorage
5. GET /users/me com Bearer token
6. Frontend renderiza home conforme is_admin
```

### Endpoints de Auth

```http
POST /auth/login                    # Login
POST /auth/forgot-password          # Solicitar reset
POST /auth/reset-password           # Confirmar reset
GET  /users/me                      # Dados atuais (autenticado)
```

## 📚 Documentação

A documentação completa está disponível em:

- **[DOCUMENTATION.MD](documentation/DOCUMENTATION.MD)** - Guia consolidado (3000+ linhas)
- **[backend/README.md](backend/README.md)** - Guia específico do backend
- **[frontend/README.md](frontend/README.md)** - Guia específico do frontend
- **[backend/migrations/README.md](backend/migrations/README.md)** - Guia de migrações

### Documentação Interativa

Acesse `http://localhost:8000/docs` (Swagger) ou `http://localhost:8000/redoc` (ReDoc) para explorar a API interativamente.

## 🛠️ Stack Tecnológico

### Backend

- **FastAPI** - Framework web assíncrono
- **SQLAlchemy** - ORM relacional
- **Alembic** - Migrações de schema
- **Pydantic v2** - Validação de dados
- **JWT** - Autenticação segura
- **Bcrypt** - Hash de senhas

### Frontend

- **Next.js 16** - Framework React com SSR
- **React 19** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Design system
- **Hooks** - State management

### Banco de Dados

- **PostgreSQL** - Produção
- **SQLite** - Desenvolvimento

## 🎯 Endpoints Principais

| Método | Rota            | Descrição                |
| ------ | --------------- | ------------------------ |
| POST   | `/auth/login`   | Login com credenciais    |
| POST   | `/users/create` | Registrar novo usuário   |
| GET    | `/users/me`     | Dados do usuário atual   |
| GET    | `/products/all` | Listar todos os produtos |
| POST   | `/cart/create`  | Adicionar ao carrinho    |
| POST   | `/sales/create` | Registrar venda          |
| GET    | `/sales/all`    | Histórico de vendas      |

Ver [DOCUMENTATION.MD](documentation/DOCUMENTATION.MD) para lista completa de 25+ endpoints.

## 🐛 Troubleshooting

### Backend não conecta ao banco

```bash
# Certifique-se de que PostgreSQL está rodando
# Windows: net start postgresql-x64-15
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Frontend mostra página em branco

1. Verifique console (F12) para erros
2. Confirme que backend está rodando em `http://localhost:8000`
3. Verifique `.env.local` tem `NEXT_PUBLIC_API_URL` correto

Ver [DOCUMENTATION.MD](documentation/DOCUMENTATION.MD#troubleshooting) para mais soluções.

## 📦 Próximos Passos

### Curto Prazo

- [ ] Completar integração de produtos (CRUD)
- [ ] Implementar carrinho totalmente funcional
- [ ] Adicionar filtros de produtos
- [ ] Integrar gateway de pagamento

### Médio Prazo

- [ ] Testes automatizados (pytest, Vitest)
- [ ] Sistema de notificações por email
- [ ] Paginação em listas
- [ ] Busca avançada de produtos

### Longo Prazo

- [ ] Deploy em produção
- [ ] CI/CD com GitHub Actions
- [ ] Analytics e logging
- [ ] Aplicativo mobile

## 📄 Estrutura de Arquivos

```
bakery-fastapi/
├── backend/               # Servidor FastAPI
│   └── README.md         # Guia específico
├── frontend/             # Cliente Next.js
│   └── README.md         # Guia específico
├── documentation/
│   ├── DOCUMENTATION.MD  # Guia completo consolidado
│   └── [outros]
└── README.MD             # Este arquivo
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja `LICENSE` para mais detalhes.

## 🙏 Créditos

- Inspiração nas aulas **FastAPI do Zero** de Edu
- Comunidade FastAPI
- Comunidade open-source

## 📞 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Status do Projeto:** Em desenvolvimento ativo  
**Última atualização:** Janeiro 2026  
**Versão:** 0.0.1
