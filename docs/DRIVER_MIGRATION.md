# 🚗 Sistema de Migração de Motoristas

## 📝 Visão Geral

O sistema de migração de motoristas permite transferir um motorista entre diferentes empresas clientes ou torná-lo independente (sem vínculo com cliente) quando detectado uma duplicação de CNH.

### ✨ Funcionalidades

- ✅ Detecção automática de CNH duplicada
- ✅ Modal de confirmação no frontend
- ✅ Migração entre clientes via API
- ✅ Suporte a motoristas independentes
- ✅ Soft delete e restore
- ✅ Auditoria completa
- ✅ Validação robusta de datas

---

## 🏛️ Arquitetura

### Backend (NestJS)

```
apps/api/src/modules/drivers/
├── drivers.controller.ts    # Rotas REST
├── drivers.service.ts       # Lógica de negócio
├── drivers.module.ts        # Módulo NestJS
├── dto/
│   ├── create-driver.dto.ts  # Validação de criação
│   ├── update-driver.dto.ts  # Validação de atualização
│   ├── filter-driver.dto.ts  # Filtros de busca
│   └── migrate-driver.dto.ts # Validação de migração ⭐
└── entities/
    └── driver.entity.ts      # Entidade Prisma
```

### Frontend (Next.js)

```
apps/web/src/components/
├── modals/
│   └── DriverMigrationModal.tsx  # Modal de migração ⭐
└── drivers/
    └── DriverForm.example.tsx    # Exemplo de integração
```

### Database (PostgreSQL)

```sql
model Driver {
  id              String    @id @default(uuid())
  licenseNumber   String    # CNH - Único por motorista ativo
  clientId        String?   # Opcional - Null = Independente
  isActive        Boolean   # Soft delete
  deletedAt       DateTime?
  // ... outros campos
}
```

---

## 🔄 Fluxo Completo

### 1️⃣ Usuário Tenta Criar Motorista Duplicado

```typescript
POST /drivers
{
  "name": "João Silva",
  "licenseNumber": "CNH12345678",
  "clientId": "empresa-b-uuid"
}
```

### 2️⃣ Backend Detecta CNH Duplicada

```typescript
// drivers.service.ts - create()
const existingDriver = await prisma.driver.findFirst({
  where: {
    licenseNumber: "CNH12345678",
    isActive: true,
  },
});

if (existingDriver) {
  throw new ConflictException({
    message: "Driver with this license number already exists",
    error: "DUPLICATE_LICENSE_NUMBER",
    existingDriver: {
      id: existingDriver.id,
      name: existingDriver.name,
      clientId: existingDriver.clientId,
      clientName: existingDriver.client?.name,
    },
  });
}
```

### 3️⃣ Frontend Captura Erro 409 e Abre Modal

```typescript
const response = await fetch('/drivers', { method: 'POST', body: ... });

if (response.status === 409) {
  const errorData = await response.json();
  setExistingDriver(errorData.existingDriver);
  setIsMigrationModalOpen(true);
}
```

### 4️⃣ Usuário Confirma Migração no Modal

```typescript
POST /drivers/{driverId}/migrate
{
  "newClientId": "empresa-b-uuid"  // ou null para independente
}
```

### 5️⃣ Backend Migra Motorista

```typescript
// drivers.service.ts - migrate()
return this.prisma.driver.update({
  where: { id: driverId },
  data: { clientId: newClientId },
});
```

### 6️⃣ Frontend Atualiza Lista

```typescript
// Modal fecha e lista de motoristas é recarregada
setIsMigrationModalOpen(false);
refreshDriversList();
```

---

## 🚀 Endpoints da API

### POST /drivers

Cria um novo motorista.

**Request:**

```json
{
  "name": "João Silva Santos",
  "cpf": "12345678900",
  "licenseNumber": "CNH12345678",
  "licenseCategory": "AB",
  "licenseExpiry": "2026-12-31T00:00:00.000Z",
  "cellphone": "31999887766",
  "status": "ATIVO",
  "clientId": "uuid-do-cliente" // Opcional
}
```

**Response (201):**

```json
{
  "id": "motorista-uuid",
  "name": "João Silva Santos",
  "licenseNumber": "CNH12345678",
  "clientId": "uuid-do-cliente"
}
```

**Response (409 - CNH Duplicada):**

```json
{
  "statusCode": 409,
  "message": "Driver with license number CNH12345678 already exists",
  "error": "DUPLICATE_LICENSE_NUMBER",
  "existingDriver": {
    "id": "motorista-existente-uuid",
    "name": "João Silva Santos",
    "clientId": "empresa-a-uuid",
    "clientName": "Empresa A Transportes"
  }
}
```

### POST /drivers/:id/migrate ⭐

Migra um motorista para outro cliente ou torna independente.

**Request:**

```json
{
  "newClientId": "novo-cliente-uuid" // ou null para independente
}
```

**Response (200):**

```json
{
  "id": "motorista-uuid",
  "name": "João Silva Santos",
  "clientId": "novo-cliente-uuid",
  "client": {
    "id": "novo-cliente-uuid",
    "name": "Empresa B Logística"
  }
}
```

### GET /drivers

Lista motoristas com filtros opcionais.

**Query Params:**

- `name` - Filtro por nome
- `cpf` - Filtro por CPF
- `licenseNumber` - Filtro por CNH
- `status` - Filtro por status (ATIVO, INATIVO, etc)
- `clientId` - Filtro por cliente
- `includeDeleted` - Incluir motoristas deletados (boolean)

### Outros Endpoints

- `GET /drivers/:id` - Buscar motorista por ID
- `PATCH /drivers/:id` - Atualizar motorista
- `DELETE /drivers/:id` - Soft delete
- `PATCH /drivers/:id/restore` - Restaurar motorista deletado
- `DELETE /drivers/:id/force` - Deletar permanentemente

---

## 🧪 Testes

### Teste Manual com SQL

Execute o script de teste:

```bash
psql -U postgres -d mag_locacao < scripts/test-driver-migration.sql
```

Ou abra o arquivo `scripts/test-driver-migration.sql` no pgAdmin/DBeaver e execute linha por linha.

### Teste via API (curl)

#### 1. Criar Motorista na Empresa A

```bash
curl -X POST http://localhost:3001/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf": "12345678900",
    "licenseNumber": "CNH12345678",
    "licenseCategory": "AB",
    "licenseExpiry": "2026-12-31T00:00:00.000Z",
    "cellphone": "31999887766",
    "status": "ATIVO",
    "clientId": "empresa-a-uuid"
  }'
```

#### 2. Tentar Criar Duplicado (deve retornar 409)

```bash
curl -X POST http://localhost:3001/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf": "12345678900",
    "licenseNumber": "CNH12345678",
    "clientId": "empresa-b-uuid"
  }'
```

#### 3. Migrar para Empresa B

```bash
curl -X POST http://localhost:3001/drivers/{motorista-id}/migrate \
  -H "Content-Type: application/json" \
  -d '{"newClientId": "empresa-b-uuid"}'
```

#### 4. Tornar Independente

```bash
curl -X POST http://localhost:3001/drivers/{motorista-id}/migrate \
  -H "Content-Type: application/json" \
  -d '{"newClientId": null}'
```

---

## 🔧 Guia de Integração Frontend

### 1. Importar o Modal

```tsx
import { DriverMigrationModal } from "@/components/modals/DriverMigrationModal";
```

### 2. Adicionar Estados

```tsx
const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
const [existingDriver, setExistingDriver] = useState<ExistingDriver | null>(null);
```

### 3. Capturar Erro 409 no Create

```tsx
try {
  const response = await fetch("/api/drivers", {
    method: "POST",
    body: JSON.stringify(formData),
  });

  if (response.status === 409) {
    const errorData = await response.json();
    if (errorData.error === "DUPLICATE_LICENSE_NUMBER") {
      setExistingDriver(errorData.existingDriver);
      setIsMigrationModalOpen(true);
      return;
    }
  }
} catch (error) {
  // Handle error
}
```

### 4. Implementar Callback de Migração

```tsx
const handleMigrationConfirm = async (driverId: string, newClientId: string | null) => {
  const clientIdToSend = newClientId === "__independent__" ? null : newClientId;

  const response = await fetch(`/api/drivers/${driverId}/migrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newClientId: clientIdToSend }),
  });

  if (!response.ok) throw new Error("Migration failed");

  // Atualizar lista
  refreshDriversList();
};
```

### 5. Renderizar Modal

```tsx
<DriverMigrationModal
  isOpen={isMigrationModalOpen}
  existingDriver={existingDriver}
  clients={clientsList}
  onConfirm={handleMigrationConfirm}
  onCancel={() => setIsMigrationModalOpen(false)}
/>
```

---

## 🐛 Troubleshooting

### Erro: "Invalid date format"

**Causa:** Data enviada em formato incorreto (ex: DD/MM/YYYY)

**Solução:** Enviar datas em formato ISO 8601:

```json
{
  "licenseExpiry": "2026-12-31T00:00:00.000Z"
}
```

### Erro: "Client with ID {uuid} not found"

**Causa:** `newClientId` enviado para `/migrate` não existe no banco

**Solução:** Verificar se cliente existe antes de migrar:

```sql
SELECT * FROM "Client" WHERE "id" = 'uuid-aqui';
```

### Modal não abre após erro 409

**Causa:** Frontend não está verificando `response.status === 409`

**Solução:** Verificar código do `handleSubmit()` e garantir que:

```tsx
if (response.status === 409) {
  const errorData = await response.json();
  // Processar erro...
}
```

---

## ❓ FAQ

**P: Posso migrar um motorista deletado?**

R: Não. Apenas motoristas ativos (`isActive: true`) podem ser migrados. Para migrar um motorista deletado, primeiro restaure-o com `PATCH /drivers/:id/restore`.

**P: O que acontece com as locações antigas ao migrar?**

R: As locações permanecem vinculadas ao motorista. A migração apenas altera o `clientId` atual do motorista.

**P: Posso migrar para o mesmo cliente?**

R: Sim, mas não faz sentido. O modal filtra o cliente atual automaticamente.

**P: Como faço para tornar um motorista independente?**

R: Envie `newClientId: null` na requisição de migração ou selecione "Motorista Independente" no modal.

---

## 📅 Histórico de Versões

### v1.0.0 (2026-01-19)

- ✅ Sistema de migração completo
- ✅ Modal de confirmação no frontend
- ✅ Validação robusta de datas
- ✅ Documentação Swagger
- ✅ Scripts de teste SQL

---

## 📚 Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Next.js Documentation](https://nextjs.org/docs)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)

---

## 👥 Contribuindo

Para adicionar melhorias ao sistema de migração:

1. Crie uma branch: `git checkout -b feat/migration-improvement`
2. Faça suas alterações
3. Teste manualmente com o script SQL
4. Atualize esta documentação se necessário
5. Abra um Pull Request

---

**Última atualização:** 2026-01-19  
**Autor:** Adair Bento  
**Status:** 🟢 Pronto para Produção
