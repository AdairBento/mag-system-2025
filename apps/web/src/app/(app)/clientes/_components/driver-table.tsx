// apps/web/src/app/(app)/clientes/_components/driver-table.tsx
"use client";

import type { Driver } from "@/types/driver";

function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length !== 11) return v;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function DriverTable({
  rows,
  loading,
  onEdit,
  onDelete,
  onMigrate,
}: {
  rows: Driver[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMigrate: (driver: Driver) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-[900px] w-full">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-600">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">CPF</th>
            <th className="px-4 py-3">CNH</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Validade</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-6 text-sm text-gray-600" colSpan={8}>
                Carregando...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-sm text-gray-600" colSpan={8}>
                Nenhum motorista encontrado.
              </td>
            </tr>
          ) : (
            rows.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{maskCPF(d.cpf)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.cnh}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.cnhCategory}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.cnhValidade}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.clientName ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.status}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => onMigrate(d)}
                      title="Migrar"
                    >
                      Migrar
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => onEdit(d.id)}
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(d.id)}
                      title="Excluir"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
