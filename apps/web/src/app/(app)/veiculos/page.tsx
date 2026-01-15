"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, Car, Filter, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { VehicleFormModal } from "./_components";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type VehicleFilters,
  type ListResponse,
} from "@/lib/api/vehicles";

const statusColors = {
  DISPONIVEL: "bg-green-100 text-green-800",
  LOCADO: "bg-blue-100 text-blue-800",
  MANUTENCAO: "bg-yellow-100 text-yellow-800",
  INATIVO: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  DISPONIVEL: "Disponível",
  LOCADO: "Locado",
  MANUTENCAO: "Manutenção",
  INATIVO: "Inativo",
};

export default function VeiculosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const { data: response, isLoading, isError } = useQuery<ListResponse<Vehicle>>({
    queryKey: ["vehicles"],
    queryFn: () => getVehicles({ search: "", status: "ALL" }, 1, 100),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      toast.success("✅ Veículo excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: () => {
      toast.error("❌ Erro ao excluir veículo");
    },
  });

  const vehicles = response?.data || [];

  const handleDelete = async (id: string) => {
    const vehicle = vehicles.find((v: Vehicle) => v.id === id);

    if (!vehicle) return;

    if (vehicle.status === "LOCADO") {
      toast.error(
        "❌ Este veículo está LOCADO e não pode ser excluído! Finalize a locação antes."
      );
      return;
    }

    if (vehicle.status === "MANUTENCAO") {
      const confirmMaintenance = confirm(
        "⚠️ Este veículo está em MANUTENÇÃO.\n\nTem certeza que deseja excluir?"
      );
      if (!confirmMaintenance) return;
    }

    if (!confirm("Tem certeza que deseja deletar este veículo?")) return;

    await deleteMut.mutateAsync(id);
  };

  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch =
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const stats = {
    total: vehicles.length,
    disponivel: vehicles.filter((v: Vehicle) => v.status === "DISPONIVEL").length,
    locado: vehicles.filter((v: Vehicle) => v.status === "LOCADO").length,
    manutencao: vehicles.filter((v: Vehicle) => v.status === "MANUTENCAO").length,
  };

  const handleSubmit = async (data: any) => {
    try {
      if (data.id) {
        await updateVehicle(data.id, data);
        toast.success("✅ Veículo atualizado com sucesso!");
      } else {
        await createVehicle(data);
        toast.success("✅ Veículo cadastrado com sucesso!");
      }
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsModalOpen(false);
      setSelectedVehicle(null);
    } catch (error: any) {
      toast.error("❌ Erro ao salvar veículo");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-gray-600 font-medium">Carregando veículos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-600 mt-1">Gerencie sua frota de veículos</p>
        </div>
        <button
          onClick={() => {
            setSelectedVehicle(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 text-white px-5 py-2.5 hover:bg-teal-700 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Veículo
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
              <Car className="w-7 h-7 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Disponíveis</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.disponivel}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Car className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Locados</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.locado}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Car className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Manutenção</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.manutencao}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Car className="w-7 h-7 text-yellow-600" />
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
              placeholder="Buscar por placa, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            >
              <option value="ALL">Todos os Status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="LOCADO">Locado</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Erro Backend */}
      {isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Erro ao carregar veículos</p>
            <p className="text-sm text-red-700 mt-1">
              Verifique se o backend está rodando ou se os endpoints estão configurados.
            </p>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!isError && vehicles.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Car className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum veículo cadastrado
          </h3>
          <p className="text-gray-600 mb-6">Comece adicionando seu primeiro veículo à frota!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 text-white px-5 py-2.5 hover:bg-teal-700 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Veículo
          </button>
        </div>
      )}

      {/* Table */}
      {vehicles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    KM
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-gray-500 font-medium">Nenhum veículo encontrado</p>
                      <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros</p>
                    </td>
                  </tr>
                ) : (
                  paginatedVehicles.map((vehicle: Vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-11 w-11 bg-teal-100 rounded-full flex items-center justify-center">
                            <Car className="h-6 w-6 text-teal-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {vehicle.marca} {vehicle.modelo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.ano} • {vehicle.cor || "Sem cor"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-bold text-gray-900">
                          {vehicle.placa}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vehicle.quilometragem?.toLocaleString("pt-BR") || "0"} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[vehicle.status as keyof typeof statusColors]
                          }`}
                        >
                          {statusLabels[vehicle.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {filteredVehicles.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} de{" "}
            {filteredVehicles.length} veículos
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? "bg-teal-600 text-white shadow-lg"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedVehicle}
      />
    </div>
  );
}
