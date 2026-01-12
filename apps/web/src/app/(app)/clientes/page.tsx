"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  User as UserIcon,
  Mail,
  Phone as PhoneIcon,
  ChevronLeft,
  ChevronRight,
  Truck,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { maskCPF, maskCNPJ, maskPhone } from "@/utils/masks";

import type { Client, ClientType, Driver } from "./_components/types";
import { normalizePaged } from "./_components/types";
import { ClientFormModal } from "./_components/client-form-modal";
import { DriverFormModal } from "./_components/driver-form-modal";

type Tab = "clients" | "drivers";

export default function ClientsPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("clients");

  // clients filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ClientType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "ATIVO" | "INADIMPLENTE" | "BLOQUEADO">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // drivers filters
  const [driverSearch, setDriverSearch] = useState("");
  const [driverPage, setDriverPage] = useState(1);

  // modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // reset page on filter change
  useEffect(() => setPage(1), [search, typeFilter, statusFilter]);
  useEffect(() => setDriverPage(1), [driverSearch]);

  const clientsQuery = useQuery({
    queryKey: ["clients", { search, typeFilter, statusFilter, page, pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      const data = await apiClient.get<unknown>("/clients?" + params.toString());
      return normalizePaged<Client>(data);
    },
  });

  const driversQuery = useQuery({
    queryKey: ["drivers", { search: driverSearch, page: driverPage, pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (driverSearch) params.set("search", driverSearch);
      params.set("page", String(driverPage));
      params.set("limit", String(pageSize));

      const data = await apiClient.get<unknown>("/drivers?" + params.toString());
      return normalizePaged<Driver>(data);
    },
  });

  const clients = clientsQuery.data?.items ?? [];
  const clientsTotal = clientsQuery.data?.total ?? 0;
  const clientsTotalPages = Math.max(1, Math.ceil(clientsTotal / pageSize));

  const drivers = driversQuery.data?.items ?? [];
  const driversTotal = driversQuery.data?.total ?? 0;
  const driversTotalPages = Math.max(1, Math.ceil(driversTotal / pageSize));

  // PJ list for DriverFormModal
  const pjClients = useMemo(() => clients.filter((c) => c.type === "PJ"), [clients]);

  // mutations
  const saveClient = useMutation({
    mutationFn: async (payload: any) => {
      const isUpdate = Boolean(payload.id);
      if (isUpdate) {
        const { id, ...body } = payload;
        return apiClient.patch<Client>("/clients/" + id, body);
      }
      return apiClient.post<Client>("/clients", payload);
    },
    onSuccess: () => {
      toast.success("Cliente salvo com sucesso!");
      setIsClientModalOpen(false);
      setEditingClient(null);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Erro ao salvar cliente"),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => apiClient.delete("/clients/" + id),
    onSuccess: () => {
      toast.success("Cliente removido!");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Erro ao remover cliente"),
  });

  const saveDriver = useMutation({
    mutationFn: async (payload: any) => {
      const isUpdate = Boolean(payload.id);
      const driverId = payload.id as string | undefined;

      // migração: se editar e mudar clientId
      if (isUpdate && editingDriver?.clientId && payload.clientId !== editingDriver.clientId) {
        // ✅ SEM fetch solto, SEM conflito
        return apiClient.post(`/drivers/${driverId}/migrate`, { newClientId: payload.clientId });
      }

      if (isUpdate) {
        const { id, ...body } = payload;
        return apiClient.patch<Driver>("/drivers/" + id, body);
      }
      return apiClient.post<Driver>("/drivers", payload);
    },
    onSuccess: () => {
      toast.success("Motorista salvo com sucesso!");
      setIsDriverModalOpen(false);
      setEditingDriver(null);
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (err: any) => {
      // 409 -> conflito/migração/regras (você pode melhorar depois)
      if (err?.response?.status === 409) return;
      toast.error("Erro ao salvar motorista");
    },
  });

  const deleteDriver = useMutation({
    mutationFn: async (id: string) => apiClient.delete("/drivers/" + id),
    onSuccess: () => {
      toast.success("Motorista removido!");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: () => toast.error("Erro ao remover motorista"),
  });

  const openNewClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const openEditClient = (c: Client) => {
    setEditingClient(c);
    setIsClientModalOpen(true);
  };

  const openNewDriver = () => {
    setEditingDriver(null);
    setIsDriverModalOpen(true);
  };

  const openEditDriver = (d: Driver) => {
    setEditingDriver(d);
    setIsDriverModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header + tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          </div>

          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setTab("clients")}
              className={
                "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all " +
                (tab === "clients" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900")
              }
            >
              <UserIcon className="w-4 h-4" />
              Clientes
            </button>
            <button
              onClick={() => setTab("drivers")}
              className={
                "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all " +
                (tab === "drivers" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900")
              }
            >
              <Truck className="w-4 h-4" />
              Motoristas
            </button>
          </div>
        </div>

        {tab === "clients" ? (
          <button
            onClick={openNewClient}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 text-white px-5 py-2.5 hover:bg-teal-700 font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        ) : (
          <button
            onClick={openNewDriver}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 text-white px-5 py-2.5 hover:bg-teal-700 font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Motorista
          </button>
        )}
      </div>

      {/* CLIENTS TAB */}
      {tab === "clients" && (
        <>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                placeholder="Buscar por nome, CPF, CNPJ..."
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="all">Tipo: Todos</option>
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="all">Status: Todos</option>
              <option value="ATIVO">Ativos</option>
              <option value="INADIMPLENTE">Inadimplentes</option>
              <option value="BLOQUEADO">Bloqueados</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Documento</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Telefone</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">E-mail</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientsQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                      Carregando...
                    </td>
                  </tr>
                ) : clients.length ? (
                  clients.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-2">
                        {c.type === "PJ" ? (
                          <Building2 className="w-4 h-4 text-slate-400" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-medium text-slate-900">{c.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={c.type === "PJ" ? "text-blue-700" : "text-green-700"}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.type === "PF" ? maskCPF(c.cpf || "") : maskCNPJ(c.cnpj || "")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-600">
                          <PhoneIcon className="w-4 h-4 text-slate-400" />
                          {maskPhone(c.phone || "") || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {c.email || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEditClient(c)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-teal-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => c.id && window.confirm(`Remover "${c.name}"?`) && deleteClient.mutate(c.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <span className="text-sm text-slate-600">
                Página {page} de {clientsTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= clientsTotalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <ClientFormModal
            isOpen={isClientModalOpen}
            title={editingClient ? "Editar Cliente" : "Novo Cliente"}
            initialData={editingClient}
            onClose={() => {
              setIsClientModalOpen(false);
              setEditingClient(null);
            }}
            onSubmit={(payload) => saveClient.mutate(payload)}
          />
        </>
      )}

      {/* DRIVERS TAB */}
      {tab === "drivers" && (
        <>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                placeholder="Buscar por nome, CPF, CNH..."
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Empresa</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">CPF</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">CNH</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Telefone</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700 w-24">Ações</th>
                </tr>
              </thead>

              <tbody>
                {driversQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                      Carregando...
                    </td>
                  </tr>
                ) : drivers.length ? (
                  drivers.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
                      <td className="px-4 py-3 text-slate-600">{d.client?.name || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{maskCPF(d.cpf || "")}</td>
                      <td className="px-4 py-3 text-slate-600">{d.cnh}</td>
                      <td className="px-4 py-3 text-slate-600">{maskPhone(d.telefone || "")}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEditDriver(d)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-teal-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => d.id && window.confirm(`Remover "${d.name}"?`) && deleteDriver.mutate(d.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                      Nenhum motorista encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <span className="text-sm text-slate-600">
                Página {driverPage} de {driversTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={driverPage <= 1}
                  onClick={() => setDriverPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={driverPage >= driversTotalPages}
                  onClick={() => setDriverPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <DriverFormModal
            isOpen={isDriverModalOpen}
            title={editingDriver ? "Editar Motorista" : "Novo Motorista"}
            initialData={editingDriver}
            clients={pjClients}
            onClose={() => {
              setIsDriverModalOpen(false);
              setEditingDriver(null);
            }}
            onSubmit={(payload) => saveDriver.mutate(payload)}
          />
        </>
      )}
    </div>
  );
}
