// apps/web/src/app/(app)/clientes/_components/driver-filters.tsx
"use client";

import type { CNHCategory, CNHStatus, DriverFilters } from "@/types/driver";

const CNH_CATEGORIES: Array<CNHCategory | "ALL"> = [
  "ALL",
  "A",
  "B",
  "AB",
  "C",
  "D",
  "E",
  "AC",
  "AD",
  "AE",
];
const CNH_STATUS: Array<CNHStatus | "ALL"> = ["ALL", "valid", "expiring", "expired"];

export function DriverFiltersBar({
  value,
  onChange,
  onNew,
  companies,
}: {
  value: DriverFilters;
  onChange: (v: DriverFilters) => void;
  onNew: () => void;
  companies: Array<{ id: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-white p-3 md:flex-row md:items-end md:justify-between">
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Buscar</label>
          <input
            className="h-9 rounded-md border px-3 text-sm"
            placeholder="Nome, CPF, CNH..."
            value={value.search ?? ""}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Empresa (PJ)</label>
          <select
            className="h-9 rounded-md border px-2 text-sm"
            value={value.clientId ?? ""}
            onChange={(e) => onChange({ ...value, clientId: e.target.value || undefined })}
          >
            <option value="">Todas</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Categoria CNH</label>
          <select
            className="h-9 rounded-md border px-2 text-sm"
            value={value.cnhCategory ?? "ALL"}
            onChange={(e) =>
              onChange({ ...value, cnhCategory: e.target.value as CNHCategory | "ALL" })
            }
          >
            {CNH_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "Todas" : c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Status CNH</label>
          <select
            className="h-9 rounded-md border px-2 text-sm"
            value={value.cnhStatus ?? "ALL"}
            onChange={(e) => onChange({ ...value, cnhStatus: e.target.value as CNHStatus | "ALL" })}
          >
            {CNH_STATUS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "Todos" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onNew}
          className="h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo Motorista
        </button>
      </div>
    </div>
  );
}
