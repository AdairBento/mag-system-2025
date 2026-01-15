# 🚀 Setup do MAG Sistema de Locação

## 💻 Pré-requisitos

- **Node.js 18+** (recomendado: 20.x)
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL 12+** OU **Docker Desktop**

---

## ⚡ Setup Automático (Recomendado)

### 1️⃣ Configure o Banco de Dados

```powershell
.\scripts\setup-database.ps1
```

**Opções disponíveis:**
- 💻 Usar PostgreSQL local existente
- 🐳 Criar container Docker automaticamente
- ✏️ Configurar manualmente

### 2️⃣ Inicie o Ambiente de Desenvolvimento

```powershell
.\scripts\start-dev.ps1
```

Isso abrirá 2 terminais:
- 🔥 **API** rodando em `http://localhost:3001`
- 🌐 **Frontend** rodando em `http://localhost:3000`

---

## 🔧 Setup Manual

### 1️⃣ Instale as dependências

```bash
pnpm install
```

### 2️⃣ Configure o PostgreSQL

**Opção A: Docker**
```bash
docker run --name mag-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mag_locacao -p 5432:5432 -d postgres:15
```

**Opção B: PostgreSQL Local**
- Instale PostgreSQL: https://www.postgresql.org/download/
- Crie o banco: `CREATE DATABASE mag_locacao;`

### 3️⃣ Crie os arquivos `.env`

**`packages/database/.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mag_locacao?schema=public"
```

**`apps/api/.env`:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mag_locacao?schema=public"
```

### 4️⃣ Rode as migrações

```bash
cd packages/database
pnpm prisma generate
pnpm prisma migrate dev --name add-vehicles
cd ../..
```

### 5️⃣ Inicie os servidores

**Terminal 1 - API:**
```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

---

## 📚 Documentação da API

Acesse o Swagger em: **http://localhost:3001/api**

---

## 🛑 Parar o Ambiente

- Pressione `Ctrl+C` nos terminais da API e Frontend
- Se usou Docker: `docker stop mag-postgres`

---

## 🔄 Resetar o Banco de Dados

```bash
cd packages/database
pnpm prisma migrate reset
pnpm prisma migrate dev
```

---

## ❓ Problemas Comuns

### Erro: "Environment variable not found: DATABASE_URL"

➡️ Execute o script de setup: `.\scripts\setup-database.ps1`

### Erro: "P2002: Unique constraint failed"

➡️ Você está tentando criar um registro duplicado (placa, RENAVAM ou chassi)

### Erro: "Can't reach database server"

➡️ Verifique se o PostgreSQL está rodando:
```bash
docker ps  # Se usando Docker
```

---

## 📞 Suporte

Em caso de problemas, verifique:
1. PostgreSQL está rodando?
2. Arquivos `.env` estão criados?
3. Migrações foram executadas?
