"use client";

import * as React from "react";
import type { Client } from "@/lib/api/clients";

type Props = {
  loading: boolean;
  data: Client[];
  items: Client[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function labelName(c: Client) {
  return c.type === "PF" ? (c.name ?? "-") : (c.razaoSocial ?? "-");
}

function labelDoc(c: Client) {
  return c.type === "PF" ? (c.cpf ?? "-") : (c.cnpj ?? "-");
}

export function ClientTable({ items, onEdit, onDelete }: Props) {
  const rows = items ?? data ?? [];

  const rows = items ?? data ?? [];

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Nome</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">CPF/CNPJ</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Telefone</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                Nenhum cliente encontrado.
              </td>
            </tr>
          ) : (
            rows.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-3 py-2">{labelName(c)}</td>
                <td className="px-3 py-2">{labelDoc(c)}</td>
                <td className="px-3 py-2">{c.cellphone ?? "-"}</td>
                <td className="px-3 py-2">{c.status}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded border px-2 py-1 hover:bg-gray-50"
                      onClick={() => onEdit(c.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded border px-2 py-1 hover:bg-gray-50"
                      onClick={() => onDelete(c.id)}
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
