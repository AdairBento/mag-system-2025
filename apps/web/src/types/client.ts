// apps/web/src/types/client.ts
// Types aligned with Prisma schema (English field names)

export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";
export type CNHCategory = "A" | "B" | "C" | "D" | "E" | "AB" | "AC" | "AD" | "AE";

export type Client = {
  id: string;
  type: ClientType;

  // Main name (PF or PJ)
  name: string;

  // Unified document (CPF/CNPJ)
  doc: string;
  cpf?: string | null;
  cnpj?: string | null;

  // ✅ PF: Driver License (INGLÊS - padrão backend)
  licenseNumber?: string | null;
  licenseCategory?: CNHCategory | string | null;
  licenseExpiry?: string | null;

  // PJ: Company fields
  companyName?: string | null;
  tradeName?: string | null;
  stateRegistration?: string | null;
  responsibleName?: string | null;
  responsiblePhone?: string | null;

  // Contact
  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  // Address
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;

  status: ClientStatus;

  createdAt?: string;
  updatedAt?: string;
};

export type ClientFilters = {
  q?: string;
  search?: string;
  type?: ClientType | "ALL";
  status?: ClientStatus | "ALL";
  city?: string;
};

export type CreateClientPayload = {
  type: ClientType;
  name: string;
  doc: string;

  // ✅ PF: CPF + Driver License (INGLÊS)
  cpf?: string | null;
  licenseNumber?: string | null;
  licenseCategory?: CNHCategory | string | null;
  licenseExpiry?: string | null;

  // PJ: CNPJ + Company fields
  cnpj?: string | null;
  companyName?: string | null;
  tradeName?: string | null;
  stateRegistration?: string | null;
  responsibleName?: string | null;
  responsiblePhone?: string | null;

  // Contact
  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  // Address
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;

  status?: ClientStatus;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;
