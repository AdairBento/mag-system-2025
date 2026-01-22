"use client";

import * as React from "react";
import type { Rental } from "@/lib/api/rentals";

type Props = {
  items: Rental[];
  onEdit: (r: Rental) => void;
  onReturn: (r: Rental) => void;
  onCancel: (r: Rental) => void;
};

function labelClient(r: Rental) {
  return r.client?.name ?? r.client?.companyName ?? "-";
}

function labelVehicle(r: Rental) {
  return `${r.vehicle?.model ?? "-"} (${r.vehicle?.plate ?? "-"})`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function RentalTable({ items, onEdit, onReturn, onCancel }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Cliente</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Veículo</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Início</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Fim</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Valor Total</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                Nenhuma locação encontrada.
              </td>
            </tr>
          ) : (
            items.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-3 py-2">{labelClient(r)}</td>
                <td className="px-3 py-2">{labelVehicle(r)}</td>
                <td className="px-3 py-2">{formatDate(r.startDate)}</td>
                <td className="px-3 py-2">{formatDate(r.endDate)}</td>
                <td className="px-3 py-2">{formatCurrency(r.totalValue)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      r.status === "ATIVA"
                        ? "bg-blue-100 text-blue-700"
                        : r.status === "CONCLUIDA"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    {r.status === "ATIVA" && (
                      <>
                        <button
                          className="rounded border px-2 py-1 hover:bg-gray-50"
                          onClick={() => onEdit(r)}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-green-500 px-2 py-1 text-green-600 hover:bg-green-50"
                          onClick={() => onReturn(r)}
                        >
                          Devolver
                        </button>
                        <button
                          className="rounded border border-red-500 px-2 py-1 text-red-600 hover:bg-red-50"
                          onClick={() => onCancel(r)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {r.status !== "ATIVA" && <span className="text-gray-400">Finalizada</span>}
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
