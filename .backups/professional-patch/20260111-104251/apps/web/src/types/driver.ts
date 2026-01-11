// apps/web/src/types/driver.ts

export type DriverStatus = "LIVRE" | "VINCULADO" | "INATIVO" | "BLOQUEADO";

export type Driver = {
  id: string;
  name: string;
  cpf: string;
  cnh?: string | null;
  phone?: string | null;
  status: DriverStatus;
  clientId?: string | null; // PJ vinculada (se existir)
  clientName?: string | null; // opcional (para tabela)
  createdAt?: string;
  updatedAt?: string;
};

export type DriverFilters = {
  q?: string;
  status?: DriverStatus | "ALL";
  clientId?: string | "ALL";
};

export type CreateDriverPayload = {
  name: string;
  cpf: string;
  cnh?: string | null;
  phone?: string | null;
  status?: DriverStatus;
  clientId?: string | null;
};

export type UpdateDriverPayload = Partial<CreateDriverPayload>;

export type MigrateDriverPayload = {
  toClientId: string;
};
