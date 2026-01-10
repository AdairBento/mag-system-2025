"use client";

import type { Driver } from "@/types/driver";
import { maskCPF } from "@/utils/masks";
import { Edit, Trash2, ArrowRightLeft } from "lucide-react";
import { Pagination } from "@/components/common/pagination";

type Meta = { total: number; page: number; limit: number; pages: number };

type Props = {
  loading: boolean;
  errorMessage?: string;
  data: Driver[];
  meta?: Meta;
  onPageChange: (page: number) => void;
  onMigrate: (driver: Driver) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function CnhBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-sm text-gray-500">—</span>;
  if (status === "valid")
    return (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
        ✅ Válida
      </span>
    );
  if (status === "expiring")
    return (
      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        ⚠️ Vencendo
      </span>
    );
  if (status === "expired")
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
        ❌ Vencida
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
      {status}
    </span>
  );
}

export function DriverTable({
  loading,
  errorMessage,
  data,
  meta,
  onPageChange,
  onMigrate,
  onEdit,
  onDelete,
}: Props) {
  const totalItems = meta?.total ?? data.length;
  const currentPage = meta?.page ?? 1;
  const totalPages = Math.max(1, meta?.pages ?? 1);
  const itemsPerPage = meta?.limit ?? 10;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {errorMessage ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          ❌ {errorMessage}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">CPF</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">CNH</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Status CNH
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                  Carregando motoristas...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                  Nenhum motorista encontrado.
                </td>
              </tr>
            ) : (
              data.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{driver.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{maskCPF(driver.cpf)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver.cnh}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {driver.cnhCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CnhBadge status={driver.cnhStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver.clientName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onMigrate(driver)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50"
                        title="Migrar motorista"
                      >
                        <ArrowRightLeft size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(driver.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(driver.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}
