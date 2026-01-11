// apps/web/src/types/client.ts

export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO" | "PENDENTE";

export type Client = {
  id: string;
  type: ClientType;
  name: string;
  doc: string; // CPF ou CNPJ (normalizado como string)
  phone?: string | null;
  city?: string | null;
  status: ClientStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ClientFilters = {
  q?: string;
  type?: ClientType | "ALL";
  status?: ClientStatus | "ALL";
  city?: string;
};

export type CreateClientPayload = {
  type: ClientType;
  name: string;
  doc: string;
  phone?: string | null;
  city?: string | null;
  status?: ClientStatus;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;
