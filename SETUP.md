# Guia de Instalação e Execução

## Pré-requisitos

- [Ruby 3.2.0](https://www.ruby-lang.org/) (recomendado via [rbenv](https://github.com/rbenv/rbenv) ou [asdf](https://asdf-vm.com/))
- [Bundler](https://bundler.io/)
- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js](https://nodejs.org/) e [Yarn](https://yarnpkg.com/)

---

## Back-end (Rails API)

### 1. Subir os serviços de infraestrutura (PostgreSQL + Redis)

Na pasta `backend/`, suba o Docker Compose:

```bash
cd backend
docker compose up -d
```

Isso irá iniciar:
- **PostgreSQL 15** na porta `5411`
- **Redis 7** na porta `6311`

Aguarde os containers ficarem saudáveis antes de continuar.

### 2. Instalar as dependências Ruby

```bash
bundle install
```

### 3. Configurar variáveis de ambiente (opcional)

Crie um arquivo `.env` dentro de `backend/` caso queira sobrescrever os valores padrão:

```env
DB_HOST=localhost
DB_PORT=5411
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Criar e migrar o banco de dados

```bash
rails db:create
rails db:migrate
```

### 5. Iniciar o servidor Rails

```bash
rails server
```

O servidor ficará disponível em `http://localhost:3000`.

---

## Front-end (React + Vite)

### 1. Instalar as dependências

Na pasta `frontend/`:

```bash
cd frontend
yarn install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
yarn dev
```

O front-end ficará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

---

## Rodando tudo junto

Abra dois terminais:

| Terminal | Comando |
|----------|---------|
| 1 | `cd backend && docker compose up -d && rails server` |
| 2 | `cd frontend && yarn dev` |
