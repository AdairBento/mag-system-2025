import type { ClientType } from "./client";

/**
 * Payload para API - usa nomes em INGLÊS (padrão do backend)
 */
export type ClientUpsertPayload = {
  id?: string;
  type: ClientType;

  // PF
  name?: string;
  cpf?: string;

  // PJ
  companyName?: string;
  cnpj?: string;
  tradeName?: string;
  stateRegistration?: string;

  // Contato
  cellphone?: string;
  telephone?: string;
  email?: string;

  // CNH
  licenseNumber?: string;
  licenseCategory?: string;
  licenseExpiry?: string;

  // Endereço
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  status?: "ATIVO" | "INATIVO" | "BLOQUEADO";
};
