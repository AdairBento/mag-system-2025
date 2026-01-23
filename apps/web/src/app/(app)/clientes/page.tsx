"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, Users, Filter, AlertCircle } from "lucide-react";
import { toast } from "sonner";
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
      toast.success("✅ Cliente criado com sucesso!");
      await qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      const message = error?.message || "Erro ao criar cliente";
      toast.error(`❌ ${message}`);
    },
  });

  const updateMut = useMutation({
    mutationFn: async (args: { id: string; data: ClientFormData }) =>
      updateClient(args.id, toPayload(args.data)),
    onSuccess: async () => {
      toast.success("✅ Cliente atualizado com sucesso!");
      await qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      const message = error?.message || "Erro ao atualizar cliente";
      toast.error(`❌ ${message}`);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => deleteClient(id),
    onSuccess: async () => {
      toast.success("✅ Cliente excluído com sucesso!");
      await qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      const message = error?.message || "Erro ao excluir cliente";
      toast.error(`❌ ${message}`);
    },
  });

  const items = q.data?.data ?? [];

  const stats = {
    total: items.length,
    pf: items.filter((c) => c.type === "PF").length,
    pj: items.filter((c) => c.type === "PJ").length,
    ativos: items.filter((c) => c.status === "ATIVO").length,
  };

  if (q.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600 font-medium">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Cadastro e gestão de clientes PF/PJ</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Users className="w-7 h-7 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pessoa Física</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.pf}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pessoa Jurídica</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.pj}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.ativos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Buscar por nome, CPF/CNPJ..."
              value={filters.search ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, search: e.target.value }));
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={filters.type ?? "ALL"}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, type: e.target.value as ClientFilters["type"] }));
              }}
            >
              <option value="ALL">Tipo: Todos</option>
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>

            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
        </div>
      </div>

      {/* Erro Backend */}
      {q.isError ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Erro ao carregar clientes</p>
            <p className="text-sm text-red-700 mt-1">
              Verifique se o backend está rodando ou se os endpoints estão configurados.
            </p>
          </div>
        </div>
      ) : null}

      {/* Estado Vazio */}
      {!q.isError && items.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum cliente cadastrado
          </h3>
          <p className="text-gray-600 mb-6">Comece adicionando seu primeiro cliente!</p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Cliente
          </button>
        </div>
      )}

      {/* Table */}
      {items.length > 0 && (
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
      )}

      {/* Paginação */}
      {items.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-600 font-medium">Página {page}</span>
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            disabled={!q.data?.meta || page >= (q.data.meta.pages || page)}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima →
          </button>
        </div>
      )}

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
