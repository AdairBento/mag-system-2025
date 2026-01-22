# CHANGELOG - MAG System

## [2026-01-21] Padronização PT → EN (Backend/Frontend Alignment)

### 🎯 Objetivo

Alinhar os campos do frontend com o Prisma schema (backend) usando nomes em **INGLÊS** nos dados, mantendo interface em **PORTUGUÊS** via i18n.

---

### ✅ Arquivos Modificados

#### **1. Types (Base)**

- `apps/web/src/types/client.ts`
  - `razaoSocial` → `companyName`
  - `nomeFantasia` → `tradeName`
  - `inscricaoEstadual` → `stateRegistration`
  - `cep` → `zipCode`
  - `logradouro` → `street`
  - `numero` → `number`
  - `bairro` → `neighborhood`
  - `cidade` → `city`
  - `uf` → `state`
  - `cnhValidade` → `cnhExpiration`

- `apps/web/src/types/vehicle.ts`
  - ✅ Já estava correto (plate, brand, model, mileage)

#### **2. API Layer**

- `apps/web/src/lib/api/rentals.ts`
  - `dailyValue` → `dailyRate`
  - `rental.client.razaoSocial` → `rental.client.companyName`
  - `rental.vehicle.placa` → `rental.vehicle.plate`
  - `rental.vehicle.modelo` → `rental.vehicle.model`
  - `rental.vehicle.marca` → `rental.vehicle.brand`

#### **3. Components**

- `apps/web/src/app/(app)/locacoes/_components/rental-table.tsx`
  - Funções `labelClient()` e `labelVehicle()` atualizadas

- `apps/web/src/app/(app)/locacoes/_components/return-modal.tsx`
  - Informações da locação atualizadas

- `apps/web/src/app/(app)/clientes/_components/client-form-modal.tsx`
  - Form defaultValues e display corrigidos

#### **4. Internationalization**

- `apps/web/src/i18n/locales/pt-BR.json`
  - Adicionada seção completa `rentals.*`
  - Adicionado `clients.fields.companyName: "Razão Social"`
  - Traduções para: plate, brand, model, mileage, dailyRate

---

### 🔄 Mapeamento de Campos

| Módulo  | Campo Antigo (PT) | Campo Novo (EN) | Tradução (pt-BR.json) |
| ------- | ----------------- | --------------- | --------------------- |
| Client  | `razaoSocial`     | `companyName`   | "Razão Social"        |
| Vehicle | `placa`           | `plate`         | "Placa"               |
| Vehicle | `modelo`          | `model`         | "Modelo"              |
| Vehicle | `marca`           | `brand`         | "Marca"               |
| Vehicle | `quilometragem`   | `mileage`       | "Quilometragem"       |
| Rental  | `dailyValue`      | `dailyRate`     | "Valor Diário"        |

---

### 📚 Arquitetura i18n
