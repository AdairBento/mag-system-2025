// apps/web/src/types/driver.ts
// Tipos compatíveis com a UI atual (CNHCategory/CNHStatus e campos opcionais).

export type DriverStatus = "ATIVO" | "INATIVO";

export type CNHCategory = "A" | "B" | "C" | "D" | "E" | "AB" | "AC" | "AD" | "AE";
export type CNHStatus = "REGULAR" | "VENCIDA" | "SUSPENSA" | "CASSADA";

export type Driver = {
  id: string;
  name: string;

  cpf: string;
  cnh?: string | null;

  // UI atual usa isso
  cnhCategory?: CNHCategory | null;
  cnhValidade?: string | null;
  telefone?: string | null;

  // mantemos também phone para padrão novo
  phone?: string | null;

  status: DriverStatus;

  clientId?: string | null;
  clientName?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export type DriverFilters = {
  q?: string;
  search?: string;

  status?: DriverStatus | "ALL";
  clientId?: string | "ALL";

  // UI atual usa estes filtros
  cnhCategory?: CNHCategory | "ALL";
  cnhStatus?: CNHStatus | "ALL";
};

export type CreateDriverPayload = {
  name: string;
  cpf: string;
  cnh?: string | null;

  cnhCategory?: CNHCategory | null;
  cnhValidade?: string | null;
  telefone?: string | null;

  phone?: string | null;

  status?: DriverStatus;
  clientId?: string | null;
};

export type UpdateDriverPayload = Partial<CreateDriverPayload>;

// compat: alguns lugares chamam newClientId
export type MigrateDriverPayload = {
  toClientId?: string;
  newClientId?: string;
};
