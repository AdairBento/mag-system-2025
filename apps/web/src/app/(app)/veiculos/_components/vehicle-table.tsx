"use client";

import * as React from "react";
import type { Vehicle } from "@/lib/api/vehicles";

type Props = {
  items: Vehicle[];
  onEdit: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
};

const statusColors: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-800",
  LOCADO: "bg-blue-100 text-blue-800",
  MANUTENCAO: "bg-yellow-100 text-yellow-800",
  INATIVO: "bg-gray-100 text-gray-800",
};

export function VehicleTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Placa</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Marca</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Modelo</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Ano</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Cor</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">KM</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>
                Nenhum veiculo encontrado.
              </td>
            </tr>
          ) : (
            items.map((v) => (
              <tr key={v.id} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">{v.placa}</td>
                <td className="px-3 py-2">{v.marca}</td>
                <td className="px-3 py-2">{v.modelo}</td>
                <td className="px-3 py-2">{v.ano}</td>
                <td className="px-3 py-2">{v.cor ?? "-"}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusColors[v.status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {v.quilometragem?.toLocaleString("pt-BR") ?? "-"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded border px-2 py-1 hover:bg-gray-50"
                      onClick={() => onEdit(v)}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded border px-2 py-1 hover:bg-gray-50"
                      onClick={() => onDelete(v)}
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
