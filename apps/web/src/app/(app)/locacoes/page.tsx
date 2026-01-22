"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createRental,
  updateRental,
  returnRental,
  cancelRental,
  getRentals,
  type ListResponse,
  type Rental,
  type RentalFilters,
} from "@/lib/api/rentals";
import { listClients } from "@/lib/api/clients";
import { getVehicles } from "@/lib/api/vehicles";
import { useState } from "react";

interface RentalFormData {
  clientId: string;
  vehicleId: string;
  driverId?: string;
  startDate: string;
  endDate: string;
  dailyRate: string;
  observations?: string;
}

interface ReturnFormData {
  returnDate: string;
  returnKm?: number;
  returnObservations?: string;
}

export default function LocacoesPage() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [returningRental, setReturningRental] = useState<Rental | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filters, setFilters] = useState<RentalFilters>({
    status: "ALL",
    search: "",
  });

  const rentalsQuery = useQuery({
    queryKey: ["rentals", filters],
    queryFn: () => getRentals(filters, 1, 100),
  });

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () => listClients({ type: "ALL", status: "ATIVO" }),
    staleTime: 30_000,
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => getVehicles({ status: "DISPONIVEL" }, 1, 100),
    staleTime: 30_000,
  });

  const createMut = useMutation({
    mutationFn: async (data: RentalFormData) => createRental(toPayload(data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Locação criada com sucesso!");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Erro ao criar locação");
    },
  });

  const updateMut = useMutation({
    mutationFn: async (args: { id: string; data: RentalFormData }) =>
      updateRental(args.id, toPayload(args.data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
      toast.success("Locação atualizada!");
      setIsModalOpen(false);
      setEditingRental(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar locação");
    },
  });

  const returnMut = useMutation({
    mutationFn: async (args: { id: string; data: ReturnFormData }) =>
      returnRental(args.id, args.data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Devolução registrada!");
      setIsReturnModalOpen(false);
      setReturningRental(null);
    },
    onError: () => {
      toast.error("Erro ao registrar devolução");
    },
  });

  const cancelMut = useMutation({
    mutationFn: async (id: string) => cancelRental(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["rentals"] });
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Locação cancelada!");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Erro ao cancelar locação");
    },
  });

  const rentals = rentalsQuery.data?.data ?? [];
  const clients = clientsQuery.data ?? [];
  const vehicles = vehiclesQuery.data?.data ?? [];

  const stats = {
    total: rentals.length,
    active: rentals.filter((r) => r.status === "ATIVA").length,
    completed: rentals.filter((r) => r.status === "CONCLUIDA").length,
    cancelled: rentals.filter((r) => r.status === "CANCELADA").length,
  };

  function toPayload(data: RentalFormData) {
    return {
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      driverId: data.driverId || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      dailyRate: Number(data.dailyRate),
      observations: data.observations || undefined,
    };
  }

  function handleCreate(data: RentalFormData) {
    createMut.mutate(data);
  }

  function handleEdit(data: RentalFormData) {
    if (!editingRental?.id) return;
    updateMut.mutate({ id: editingRental.id, data });
  }

  function handleReturn(data: ReturnFormData) {
    if (!returningRental?.id) return;
    returnMut.mutate({ id: returningRental.id, data });
  }

  function handleCancel() {
    if (!deleteId) return;
    cancelMut.mutate(deleteId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Locações</h1>
        <button
          onClick={() => {
            setEditingRental(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nova Locação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Ativas</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Concluídas</div>
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Canceladas</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="font-semibold">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status ?? "ALL"}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as RentalFilters["status"] })
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="ALL">Todas</option>
            <option value="ATIVA">Ativas</option>
            <option value="CONCLUIDA">Concluídas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
          <input
            type="text"
            value={filters.search ?? ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Buscar..."
            className="border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Diária
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rentals.map((rental) => (
              <tr key={rental.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rental.client?.name ?? rental.client?.companyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rental.vehicle?.brand} {rental.vehicle?.model}
                  <div className="text-xs text-gray-500">{rental.vehicle?.plate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(rental.startDate).toLocaleDateString()} -{" "}
                  {new Date(rental.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">R$ {rental.dailyRate.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      rental.status === "ATIVA"
                        ? "bg-green-100 text-green-800"
                        : rental.status === "CONCLUIDA"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {rental.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  {rental.status === "ATIVA" && (
                    <>
                      <button
                        onClick={() => {
                          setReturningRental(rental);
                          setIsReturnModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Devolver
                      </button>
                      <button
                        onClick={() => {
                          setEditingRental(rental);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteId(rental.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
