// apps/web/src/types/client.ts
// Tipos compatíveis com a UI atual (campos opcionais para não quebrar modais/tabelas).

export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";

export type Client = {
  id: string;
  type: ClientType;

  // Nome principal (PF ou PJ)
  name: string;

  // Documento unificado (CPF/CNPJ). Mantemos também aliases opcionais para UI legada.
  doc: string;
  cpf?: string | null;
  cnpj?: string | null;

  // PJ (legado UI)
  razaoSocial?: string | null;
  nomeFantasia?: string | null;

  // Contato (UI legada usa cellphone/email)
  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  city?: string | null;
  status: ClientStatus;

  createdAt?: string;
  updatedAt?: string;
};

export type ClientFilters = {
  // padrão novo
  q?: string;
  // compat UI atual
  search?: string;

  type?: ClientType | "ALL";
  status?: ClientStatus | "ALL";
  city?: string;
};

export type CreateClientPayload = {
  type: ClientType;
  name: string;
  doc: string;

  cpf?: string | null;
  cnpj?: string | null;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;

  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  city?: string | null;
  status?: ClientStatus;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;
