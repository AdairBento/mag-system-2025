"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientFormModal, type ClientFormData } from "./_components/client-form-modal";
import { ClientTable } from "./_components/client-table";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  type Client,
  type ClientFilters,
  type ListResponse,
} from "@/lib/api/clients";

function toPayload(v: ClientFormData): Record<string, unknown> {
  if (v.type === "PF") {
    return {
      type: "PF",
      status: v.status,
      name: v.name,
      cpf: v.cpf,
      cellphone: v.cellphone ?? "",
      email: v.email ?? "",
    };
  }
  return {
    type: "PJ",
    status: v.status,
    razaoSocial: v.razaoSocial,
    cnpj: v.cnpj,
    nomeFantasia: v.nomeFantasia ?? "",
    cellphone: v.cellphone ?? "",
    email: v.email ?? "",
  };
}

export default function ClientesPage() {
  const qc = useQueryClient();

  const [filters, setFilters] = React.useState<ClientFilters>({
    type: "ALL",
    status: "ALL",
    search: "",
  });
  const [page, setPage] = React.useState<number>(1);

  const [open, setOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<Client | null>(null);

  const q = useQuery<ListResponse<Client>>({
    queryKey: ["clients", filters, page],
    queryFn: () => getClients(filters, page, 10),
    staleTime: 10_000,
  });

  const createMut = useMutation({
    mutationFn: async (data: ClientFormData) => createClient(toPayload(data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: async (args: { id: string; data: ClientFormData }) =>
      updateClient(args.id, toPayload(args.data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => deleteClient(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const items = q.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-500">Cadastro e gestao de clientes PF/PJ</p>
        </div>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
          placeholder="Buscar por nome, CPF/CNPJ..."
          value={filters.search ?? ""}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, search: e.target.value }));
          }}
        />

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.type ?? "ALL"}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, type: e.target.value as ClientFilters["type"] }));
          }}
        >
          <option value="ALL">Tipo: Todos</option>
          <option value="PF">Pessoa Fisica</option>
          <option value="PJ">Pessoa Juridica</option>
        </select>

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.status ?? "ALL"}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, status: e.target.value as ClientFilters["status"] }));
          }}
        >
          <option value="ALL">Status: Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="BLOQUEADO">Bloqueado</option>
        </select>
      </div>

      {q.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Erro ao carregar clientes.
        </div>
      ) : null}

      <ClientTable
        items={items}
        onEdit={(c) => {
          setEditing(c);
          setOpen(true);
        }}
        onDelete={(c) => {
          if (confirm("Excluir este cliente?")) {
            deleteMut.mutate(c.id);
          }
        }}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <button
          className="rounded border px-3 py-1 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <span>Pagina {page}</span>
        <button
          className="rounded border px-3 py-1 disabled:opacity-50"
          disabled={!q.data?.meta || page >= (q.data.meta.pages || page)}
          onClick={() => setPage((p) => p + 1)}
        >
          Proxima
        </button>
      </div>

      <ClientFormModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        title={editing ? "Editar Cliente" : "Novo Cliente"}
        onSubmit={async (data) => {
          if (editing) {
            await updateMut.mutateAsync({ id: editing.id, data });
          } else {
            await createMut.mutateAsync(data);
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
