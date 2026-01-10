export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";

export type ClientFilters = {
  search?: string;
  type?: ClientType | "ALL";
  status?: ClientStatus | "ALL";
};

export type Client = {
  id: string;
  type: ClientType;
  name?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  cellphone?: string;
  status: ClientStatus;
  createdAt?: string;
  updatedAt?: string;
};
