"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { RentalFormModal, type RentalFormData } from "./_components/rental-form-modal";
import { ReturnModal, type ReturnFormData } from "./_components/return-modal";
import { RentalTable } from "./_components/rental-table";
import {
  getRentals,
  createRental,
  updateRental,
  returnRental,
  cancelRental,
  type Rental,
  type RentalFilters,
  type ListResponse,
} from "@/lib/api/rentals";
import { getClients, type Client } from "@/lib/api/clients";
import { getVehicles, type Vehicle } from "@/lib/api/vehicles";

function toPayload(v: RentalFormData) {
  return {
    clientId: v.clientId,
    vehicleId: v.vehicleId,
    startDate: v.startDate,
    endDate: v.endDate,
    initialKm: v.initialKm,
    dailyValue: v.dailyValue,
    discount: v.discount ?? 0,
    observations: v.observations ?? "",
  };
}

export default function LocacoesPage() {
  const qc = useQueryClient();

  const [filters, setFilters] = React.useState<RentalFilters>({
    status: "ALL",
    search: "",
  });
  const [page, setPage] = React.useState<number>(1);

  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [returnOpen, setReturnOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<Rental | null>(null);
  const [returning, setReturning] = React.useState<Rental | null>(null);

  const rentalsQuery = useQuery<ListResponse<Rental>>({
    queryKey: ["rentals", filters, page],
    queryFn: () => getRentals(filters, page, 10),
    staleTime: 10_000,
  });

  const clientsQuery = useQuery<ListResponse<Client>>({
    queryKey: ["clients"],
    queryFn: () => getClients({ type: "ALL", status: "ATIVO" }, 1, 100),
    staleTime: 30_000,
  });

  const vehiclesQuery = useQuery<ListResponse<Vehicle>>({
    queryKey: ["vehicles"],
    queryFn: () => getVehicles({ status: "DISPONIVEL" }, 1, 100),
    staleTime: 30_000,
  });

  const createMut = useMutation({
    mutationFn: async (data: RentalFormData) => createRental(toPayload(data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: async (args: { id: string; data: RentalFormData }) =>
      updateRental(args.id, toPayload(args.data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
    },
  });

  const returnMut = useMutation({
    mutationFn: async (args: { id: string; data: ReturnFormData }) =>
      returnRental(args.id, args.data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const cancelMut = useMutation({
    mutationFn: async (id: string) => cancelRental(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const rentals = rentalsQuery.data?.data ?? [];
  const clients = clientsQuery.data?.data ?? [];
  const vehicles = vehiclesQuery.data?.data ?? [];

  // Calcular métricas
  const stats = {
    total: rentals.length,
    active: rentals.filter((r) => r.status === "ATIVA").length,
    completed: rentals.filter((r) => r.status === "CONCLUIDA").length,
    cancelled: rentals.filter((r) => r.status === "CANCELADA").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locações</h1>
          <p className="text-gray-600 mt-1">Gerencie sua frota de locações</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 text-white px-5 py-2.5 hover:bg-teal-700 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Locação
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
              <FileText className="w-7 h-7 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ativas</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Concluídas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Canceladas</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.cancelled}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <XCircle className="w-7 h-7 text-yellow-600" />
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
              type="text"
              placeholder="Buscar por cliente ou veículo..."
              value={filters.search ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, search: e.target.value }));
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filters.status ?? "ALL"}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, status: e.target.value as RentalFilters["status"] }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ATIVA">Ativa</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {rentalsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Erro ao carregar locações.
        </div>
      ) : null}

      <RentalTable
        items={rentals}
        onEdit={(r) => {
          setEditing(r);
          setFormOpen(true);
        }}
        onReturn={(r) => {
          setReturning(r);
          setReturnOpen(true);
        }}
        onCancel={(r) => {
          if (confirm("Cancelar esta locação?")) {
            cancelMut.mutate(r.id);
          }
        }}
      />

      <div className="flex items-center justify-between px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600 font-medium">Página {page}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            ←
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!rentalsQuery.data?.meta || page >= (rentalsQuery.data.meta.pages || page)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            →
          </button>
        </div>
      </div>

      <RentalFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        title={editing ? "Editar Locação" : "Nova Locação"}
        clients={clients}
        vehicles={vehicles}
        onSubmit={async (data) => {
          if (editing) {
            await updateMut.mutateAsync({ id: editing.id, data });
          } else {
            await createMut.mutateAsync(data);
          }
          setFormOpen(false);
        }}
      />

      <ReturnModal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        rental={returning}
        onSubmit={async (data) => {
          if (returning) {
            await returnMut.mutateAsync({ id: returning.id, data });
            setReturnOpen(false);
          }
        }}
      />
    </div>
  );
}
