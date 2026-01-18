"use client";

import { Search, Plus } from "lucide-react";
import type { ClientFilters as ClientFiltersType, ClientStatus, ClientType } from "@/types/client";

type Props = {
  value: ClientFiltersType;
  onChange: (next: ClientFiltersType) => void;
  onNew: () => void;
};

export function ClientFilters({ value, onChange, onNew }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ, telefone..."
            value={value.search ?? ""}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={value.type ?? "ALL"}
            onChange={(e) => onChange({ ...value, type: e.target.value as ClientType | "ALL" })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Todos os tipos</option>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>

          <select
            value={value.status ?? "ALL"}
            onChange={(e) => onChange({ ...value, status: e.target.value as ClientStatus | "ALL" })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
          </select>

          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

// Export alias for backward compatibility
export { ClientFilters as ClientFiltersBar };
