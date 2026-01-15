"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VehicleFormModal, VehicleTable, type VehicleFormData } from "./_components";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type VehicleFilters,
  type ListResponse,
} from "@/lib/api/vehicles";

function toPayload(v: VehicleFormData): Record<string, unknown> {
  return {
    placa: v.placa.toUpperCase(),
    marca: v.marca,
    modelo: v.modelo,
    ano: v.ano,
    cor: v.cor ?? "",
    status: v.status,
    quilometragem: v.quilometragem ?? 0,
    renavam: v.renavam ?? "",
    chassi: v.chassi ?? "",
  };
}

export default function VeiculosPage() {
  const qc = useQueryClient();

  const [filters, setFilters] = React.useState<VehicleFilters>({
    status: "ALL",
    search: "",
  });
  const [page, setPage] = React.useState<number>(1);

  const [open, setOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<Vehicle | null>(null);

  const q = useQuery<ListResponse<Vehicle>>({
    queryKey: ["vehicles", filters, page],
    queryFn: () => getVehicles(filters, page, 10),
    staleTime: 10_000,
  });

  const createMut = useMutation({
    mutationFn: async (data: VehicleFormData) => createVehicle(toPayload(data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: async (args: { id: string; data: VehicleFormData }) =>
      updateVehicle(args.id, toPayload(args.data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => deleteVehicle(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const items = q.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Veiculos</h1>
          <p className="text-sm text-gray-500">Gestao da frota de veiculos</p>
        </div>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Novo Veiculo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
          placeholder="Buscar por placa, marca ou modelo..."
          value={filters.search ?? ""}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, search: e.target.value }));
          }}
        />

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.status ?? "ALL"}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, status: e.target.value as VehicleFilters["status"] }));
          }}
        >
          <option value="ALL">Status: Todos</option>
          <option value="DISPONIVEL">Disponivel</option>
          <option value="LOCADO">Locado</option>
          <option value="MANUTENCAO">Manutencao</option>
          <option value="INATIVO">Inativo</option>
        </select>
      </div>

      {q.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Erro ao carregar veiculos.
        </div>
      ) : null}

      <VehicleTable
        items={items}
        onEdit={(v) => {
          setEditing(v);
          setOpen(true);
        }}
        onDelete={(v) => {
          if (confirm("Excluir este veiculo?")) {
            deleteMut.mutate(v.id);
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

      <VehicleFormModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        title={editing ? "Editar Veiculo" : "Novo Veiculo"}
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
