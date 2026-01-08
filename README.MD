## Padaria da Vila

Espaço para experimentar um front-end mobile-first em Next.js integrado a um back-end robusto em FastAPI. O foco é oferecer uma vitrine/loja virtual para a padaria, com autenticação JWT, persistência relacional via SQLAlchemy e esteira preparada para futuras migrações e observabilidade.

### Arquitetura planejada

- **Frontend**: Next.js (React) com design responsivo voltado a dispositivos móveis, consumo via REST e futura adoção de componentes server-side.
- **Backend**: FastAPI + Uvicorn, camada de autenticação OAuth2/JWT, ORM SQLAlchemy e migrações (Alembic) para manter o esquema consistente.
- **Banco**: Compatível com PostgreSQL (ou qualquer banco suportado pelo SQLAlchemy URL configurado).
- **Infra**: Arquivo `.env` para credenciais, separação clara entre camadas (`auth/`, `routes/`, `db/`, `config/`).

### Funcionalidades atuais

- App FastAPI exposto em `backend/app.py` com rota `GET /health`.
- Modelo de dados inicial em `backend/db/entities.py` (clientes, administradores, produtos, vendas e carrinhos) e conexão genérica em `backend/db/connection.py`.
- Utilitários de autenticação em `backend/auth/auth.py` (hash de senha com bcrypt, geração/validação de JWT, dependência `get_current_user`).
- Router base de autenticação em `backend/routes/auth.py` para receber credenciais via `OAuth2PasswordRequestForm`.
- Sistema de configuração centralizado em `backend/config/config.py`, carregando variáveis de ambiente via `python-dotenv`.

### Como executar o back-end localmente

1. Crie e ative um ambiente virtual Python 3.11+:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   ```
2. Instale as dependências principais (ajuste conforme necessário):
   ```bash
   pip install fastapi uvicorn[standard] sqlalchemy python-dotenv bcrypt pyjwt
   ```
3. Configure um arquivo `.env` na pasta `backend/` com, por exemplo:
   ```ini
   DB_URL=postgresql+psycopg2://user:password@localhost:5432/padaria
   DEBUG=TRUE
   ALGORITHM=HS256
   SECRET_KEY=uma-chave-secreta-super-segura
   ACCESS_TOKEN_EXPIRE_TIME=4320
   ```
4. Dentro de `backend/`, execute:
   ```bash
   uvicorn app:app --reload
   ```
5. Acesse `http://localhost:8000/health` para validar o serviço.

### Próximos passos

- Implementar as rotas completas de autenticação (`/auth/token`, refresh, cadastro de clientes e admins).
- Adicionar Alembic para migrações versionadas e scripts de seed.
- Criar módulos de domínio (produtos, carrinho, vendas) com serviços e validações.
- Construir o frontend Next.js com foco em UX mobile, consumo via hooks (SWR/React Query) e tema consistente com a marca.
- Automatizar testes (unitários e e2e) e configurar CI/CD.

### Créditos e referências

- Conteúdo inspirado nas aulas do Edu, especialmente o material **FastAPI do Zero** disponível em [fastapidozero.dunossauro.com/estavel](https://fastapidozero.dunossauro.com/estavel/).
- Agradecimento à comunidade FastAPI e ao ecossistema open-source que embasa este projeto.

> Projeto em andamento: contribuições, sugestões e críticas construtivas são muito bem-vindas.
