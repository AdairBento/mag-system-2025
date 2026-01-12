export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INADIMPLENTE" | "BLOQUEADO";

export interface Client {
  id: string;
  type: ClientType;
  status?: ClientStatus;

  name: string;
  email?: string;
  phone?: string;

  cpf?: string;
  cnpj?: string;
  ie?: string;

  // PF (se você quiser usar cliente PF com CNH)
  cnh?: string;
  cnhExpiration?: string;

  // endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export type DriverStatus = "ATIVO" | "INATIVO";

export interface Driver {
  id: string;
  name: string;
  cpf: string;

  cnh: string;
  cnhCategory?: string;
  cnhExpiration?: string;

  telefone?: string;
  status: DriverStatus;

  clientId: string;
  client?: { id: string; name: string };
}

export type Paged<T> = { items: T[]; total: number };

// blindagem real: aceita [] OU {items,total} OU {data: []} OU {ok,data: []}
export function normalizePaged<T>(data: unknown): Paged<T> {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // { items, total }
    if (Array.isArray(obj.items) && typeof obj.total === "number") {
      return { items: obj.items as T[], total: obj.total };
    }

    // { data: [] }
    if (Array.isArray(obj.data)) {
      const items = obj.data as T[];
      return { items, total: items.length };
    }

    // { ok: true, data: [] }
    if (Array.isArray(obj.data)) {
      const items = obj.data as T[];
      return { items, total: items.length };
    }
  }

  // []
  if (Array.isArray(data)) return { items: data as T[], total: data.length };

  return { items: [], total: 0 };
}
