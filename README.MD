## Padaria da Vila

Espaço para experimentar um front-end mobile-first em Next.js integrado a um back-end robusto em FastAPI. O foco é oferecer uma vitrine/loja virtual para a padaria, com autenticação JWT, persistência relacional via SQLAlchemy e esteira preparada para futuras migrações e observabilidade.

### Arquitetura planejada

- **Frontend**: Next.js (React) com design responsivo voltado a dispositivos móveis, consumo via REST e futura adoção de componentes server-side.
- **Backend**: FastAPI + Uvicorn, camada de autenticação OAuth2/JWT, ORM SQLAlchemy e migrações (Alembic) para manter o esquema consistente.
- **Banco**: Compatível com PostgreSQL (ou qualquer banco suportado pelo SQLAlchemy URL configurado).
- **Infra**: Arquivo `.env` para credenciais, separação clara entre camadas (`auth/`, `routes/`, `db/`, `config/`).

### Funcionalidades atuais

- **App FastAPI** exposto em `backend/app.py` com rota `GET /health` e rotas de negócio organizadas por módulos.
- **Modelo de dados** completo em `backend/db/entities.py` (User, Product, Sale, Cart) com relacionamentos definidos via SQLAlchemy ORM.
- **Autenticação OAuth2/JWT**: Sistema completo em `backend/auth/auth.py` com hash bcrypt, geração/validação de tokens e dependência `get_current_user` para proteção de rotas.
- **Schemas Pydantic v2**: Todos os schemas configurados com `ConfigDict(from_attributes=True)` para conversão automática de objetos ORM, validação de entrada e serialização de resposta.
- **API REST completa** com as seguintes rotas implementadas:
  - **Auth** (`/auth`): Login via OAuth2, geração de tokens JWT
  - **Users** (`/users`): CRUD completo com controle de acesso admin, endpoints `/all`, `/me`, `/create`, `/{id}`, PATCH e DELETE
  - **Products** (`/products`): Gestão de produtos com filtros por categoria, controle de estoque e imagens
  - **Sales** (`/sales`): Registro de vendas com filtros por usuário/produto, controle de pagamento, histórico completo
  - **Cart** (`/cart`): Gerenciamento de carrinho de compras
- **Controle de acesso**: Diferenciação entre usuários comuns e administradores, validação de propriedade de recursos.
- **Tratamento de exceções** centralizado em `backend/exceptions/handle_exceptions.py` com respostas HTTP adequadas.
- **Configuração centralizada** em `backend/config/config.py`, carregando variáveis de ambiente via `python-dotenv`.

### Como executar o back-end localmente

1. Crie e ative um ambiente virtual Python 3.11+:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   ```
2. Instale as dependências principais (ajuste conforme necessário):
   ```bash
   pip install fastapi uvicorn[standard] sqlalchemy python-dotenv bcrypt pyjwt python-multipart
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
6. Acesse `http://localhost:8000/docs` para visualizar a documentação interativa Swagger com todos os endpoints disponíveis.

### Próximos passos

- Adicionar Alembic para migrações versionadas e scripts de seed do banco de dados.
- Implementar refresh tokens e expiração avançada de sessões.
- Adicionar validações de negócio mais robustas (verificação de estoque antes de venda, cálculo automático de totais).
- Implementar upload e otimização de imagens de produtos.
- Construir o frontend Next.js com foco em UX mobile, consumo via hooks (SWR/React Query) e tema consistente com a marca.
- Adicionar documentação Swagger/OpenAPI detalhada para cada endpoint.
- Implementar testes automatizados (unitários com pytest, integração e e2e).
- Configurar CI/CD com GitHub Actions para deploy automático.
- Adicionar logging estruturado e observabilidade (métricas, traces).

### Créditos e referências

- Conteúdo inspirado nas aulas do Edu, especialmente o material **FastAPI do Zero** disponível em [fastapidozero.dunossauro.com/estavel](https://fastapidozero.dunossauro.com/estavel/).
- Agradecimento à comunidade FastAPI e ao ecossistema open-source que embasa este projeto.

> Projeto em andamento: contribuições, sugestões e críticas construtivas são muito bem-vindas.
