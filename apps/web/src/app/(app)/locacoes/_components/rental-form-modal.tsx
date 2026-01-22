/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Rental } from "@/lib/api/rentals";

const schema = z.object({
  clientId: z.string().min(1, "Cliente obrigatório"),
  vehicleId: z.string().min(1, "Veículo obrigatório"),
  startDate: z.string().min(1, "Data de início obrigatória"),
  endDate: z.string().min(1, "Data de fim obrigatória"),
  initialKm: z.number().min(0, "KM inicial obrigatório"),
  dailyRate: z.number().min(0, "Valor diário obrigatório"),
  discount: z.number().min(0).default(0),
  observations: z.string().optional(),
});

export type RentalFormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RentalFormData) => Promise<void> | void;
  initial?: Rental | null;
  title?: string;
  clients: Array<{ id: string; name?: string; companyName?: string }>;
  vehicles: Array<{ id: string; model: string; plate: string; mileage?: number }>;
};

const DEFAULTS: RentalFormData = {
  clientId: "",
  vehicleId: "",
  startDate: "",
  endDate: "",
  initialKm: 0,
  dailyRate: 0,
  discount: 0,
  observations: "",
};

export function RentalFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  title,
  clients,
  vehicles,
}: Props) {
  const form = useForm<RentalFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: DEFAULTS,
  });

  React.useEffect(() => {
    if (!open) return;
    if (!initial) {
      form.reset(DEFAULTS);
      return;
    }
    form.reset({
      clientId: initial.clientId,
      vehicleId: initial.vehicleId,
      startDate: initial.startDate.split("T")[0],
      endDate: initial.endDate.split("T")[0],
      initialKm: initial.initialKm,
      dailyRate: initial.dailyRate,
      discount: initial.discount,
      observations: initial.observations ?? "",
    });
  }, [open, initial, form]);

  const selectedVehicleId = form.watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {title ?? (initial ? "Editar Locação" : "Nova Locação")}
          </h2>
          <button className="rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>
            X
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Cliente *</div>
              <select
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("clientId")}
              >
                <option value="">Selecione...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ?? c.companyName}
                  </option>
                ))}
              </select>
              {form.formState.errors.clientId && (
                <p className="mt-1 text-xs text-red-500">
                  {form.formState.errors.clientId.message}
                </p>
              )}
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Veículo *</div>
              <select
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("vehicleId", {
                  onChange: (e) => {
                    const vehicle = vehicles.find((v) => v.id === e.target.value);
                    if (vehicle?.mileage) {
                      form.setValue("initialKm", vehicle.mileage);
                    }
                  },
                })}
              >
                <option value="">Selecione...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} - {v.plate}
                  </option>
                ))}
              </select>
              {form.formState.errors.vehicleId && (
                <p className="mt-1 text-xs text-red-500">
                  {form.formState.errors.vehicleId.message}
                </p>
              )}
            </label>
          </div>

          {selectedVehicle && (
            <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">
              KM atual do veículo: {selectedVehicle.mileage?.toLocaleString() ?? "N/A"}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Data Início *</div>
              <input
                type="date"
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("startDate")}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Data Fim *</div>
              <input
                type="date"
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("endDate")}
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">KM Inicial *</div>
              <input
                type="number"
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("initialKm", { valueAsNumber: true })}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Valor Diário (R$) *</div>
              <input
                type="number"
                step="0.01"
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("dailyRate", { valueAsNumber: true })}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Desconto (R$)</div>
              <input
                type="number"
                step="0.01"
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("discount", { valueAsNumber: true })}
              />
            </label>
          </div>

          <label className="text-sm">
            <div className="mb-1 font-medium text-gray-700">Observações</div>
            <textarea
              className="w-full rounded border border-gray-300 p-2"
              rows={3}
              {...form.register("observations")}
            />
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!form.formState.isValid}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {initial ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
