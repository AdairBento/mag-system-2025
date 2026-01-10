"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { Client, ClientFilters } from "@/lib/api/clients";
import { getClients } from "@/lib/api/clients";
import { ClientFormModal, type ClientFormData } from "./_components/client-form-modal";

export default function ClientesPage() {
  const [filters, setFilters] = React.useState<ClientFilters>({});
  const [page, setPage] = React.useState(1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<Client | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients", filters, page],
    queryFn: () => getClients(filters, page, 10),
  });

  const clients: Client[] = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 10, pages: 0 };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async (data: ClientFormData) => {
    // TODO: Implementar submit para API
    console.log("Submit:", data);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={handleOpenCreate}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Novo Cliente
        </button>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-4">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value || undefined,
              })
            }
            className="flex-1 rounded border border-gray-300 px-3 py-2"
          />

          <select
            value={filters.type ?? "ALL"}
            onChange={(e) =>
              setFilters({
                ...filters,
                type: e.target.value === "ALL" ? undefined : (e.target.value as any),
              })
            }
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="ALL">Todos os tipos</option>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>

          <select
            value={filters.status ?? "ALL"}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value === "ALL" ? undefined : (e.target.value as any),
              })
            }
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="ALL">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
          </select>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">Erro ao carregar clientes</div>
        ) : clients.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Nenhum cliente</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left text-sm font-semibold">Tipo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Nome/Razão</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Doc</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      {client.type === "PF" ? "👤 PF" : "🏢 PJ"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {client.type === "PF" ? client.name : client.razaoSocial}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {client.type === "PF" ? client.cpf : client.cnpj}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          client.status === "ATIVO"
                            ? "bg-green-100 text-green-800"
                            : client.status === "INATIVO"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {meta.page} de {meta.pages} ({meta.total} registros)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page >= meta.pages}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      <ClientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initial={editingClient}
        title={editingClient ? "✏️ Editar Cliente" : "➕ Novo Cliente"}
      />
    </div>
  );
}
