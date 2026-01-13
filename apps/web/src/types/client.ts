// apps/web/src/types/client.ts
// Tipos compatíveis com a UI atual (campos opcionais para não quebrar modais/tabelas).

export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";
export type CNHCategory = "A" | "B" | "C" | "D" | "E" | "AB" | "AC" | "AD" | "AE";

export type Client = {
  id: string;
  type: ClientType;

  // Nome principal (PF ou PJ)
  name: string;

  // Documento unificado (CPF/CNPJ)
  doc: string;
  cpf?: string | null;
  cnpj?: string | null;

  // PF: CNH + Categoria + Validade
  cnh?: string | null;
  cnhCategory?: CNHCategory | string | null;
  cnhValidade?: string | null;
  cnhExpiration?: string | null; // ✅ ADICIONAR (alias para cnhValidade)

  // PJ
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
  ie?: string | null; // ✅ ADICIONAR (Inscrição Estadual)
  inscricaoEstadual?: string | null; // ✅ ADICIONAR (alias)
  responsibleName?: string | null; // ✅ ADICIONAR
  responsiblePhone?: string | null; // ✅ ADICIONAR

  // Contato
  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  // Endereço
  cep?: string | null; // ✅ ADICIONAR
  logradouro?: string | null; // ✅ ADICIONAR
  numero?: string | null; // ✅ ADICIONAR
  complemento?: string | null; // ✅ ADICIONAR
  bairro?: string | null; // ✅ ADICIONAR
  cidade?: string | null; // ✅ ADICIONAR
  city?: string | null; // alias
  uf?: string | null; // ✅ ADICIONAR

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

  // PF: CPF + CNH
  cpf?: string | null;
  cnh?: string | null;
  cnhCategory?: CNHCategory | string | null;
  cnhValidade?: string | null;
  cnhExpiration?: string | null;

  // PJ: CNPJ + Razão Social + Responsável
  cnpj?: string | null;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
  ie?: string | null;
  inscricaoEstadual?: string | null;
  responsibleName?: string | null;
  responsiblePhone?: string | null;

  // Contato
  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  // Endereço
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  city?: string | null;
  uf?: string | null;

  status?: ClientStatus;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;
