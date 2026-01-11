// apps/web/src/app/(app)/clientes/_components/client-table.tsx
"use client";

import type { Client } from "@/types/client";

type Props = {
  data: Client[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ClientTable({ data, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Nenhum cliente encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-left">Doc</th>
            <th className="px-3 py-2 text-left">Telefone</th>
            <th className="px-3 py-2 text-left">Cidade</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="border-b last:border-b-0">
              <td className="px-3 py-2">{c.name}</td>
              <td className="px-3 py-2">{c.doc ?? c.cpf ?? c.cnpj ?? "-"}</td>
              <td className="px-3 py-2">{c.cellphone ?? c.phone ?? "-"}</td>
              <td className="px-3 py-2">{c.city ?? "-"}</td>
              <td className="px-3 py-2">{c.status}</td>
              <td className="px-3 py-2 text-right">
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    className="rounded-md border px-2 py-1 hover:bg-muted"
                    onClick={() => onEdit(c.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded-md border px-2 py-1 hover:bg-muted"
                    onClick={() => onDelete(c.id)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientTable;
