/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Rental } from "@/lib/api/rentals";

const schema = z.object({
  finalKm: z.number().min(0, "KM final obrigatório"),
  observations: z.string().optional(),
});

export type ReturnFormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReturnFormData) => Promise<void> | void;
  rental: Rental | null;
};

export function ReturnModal({ open, onClose, onSubmit, rental }: Props) {
  const form = useForm<ReturnFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      finalKm: 0,
      observations: "",
    },
  });

  React.useEffect(() => {
    if (!open || !rental) return;
    form.reset({
      finalKm: rental.initialKm,
      observations: "",
    });
  }, [open, rental, form]);

  if (!open || !rental) return null;

  const finalKm = form.watch("finalKm");
  const kmDriven = finalKm - rental.initialKm;
  const needsMaintenance = kmDriven > 5000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Devolver Veículo</h2>
          <button className="rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>
            X
          </button>
        </div>

        <div className="mb-4 rounded bg-gray-50 p-3 text-sm">
          <div className="mb-2 font-medium">Informações da Locação</div>
          <div className="space-y-1 text-gray-600">
            <div>Cliente: {rental.client?.name ?? rental.client?.razaoSocial ?? "-"}</div>
            <div>
              Veículo: {rental.vehicle?.modelo ?? "-"} ({rental.vehicle?.placa ?? "-"})
            </div>
            <div>KM Inicial: {rental.initialKm.toLocaleString()}</div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <label className="text-sm">
            <div className="mb-1 font-medium text-gray-700">KM Final *</div>
            <input
              type="number"
              className="w-full rounded border border-gray-300 p-2"
              {...form.register("finalKm", { valueAsNumber: true })}
            />
            {form.formState.errors.finalKm && (
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.finalKm.message}</p>
            )}
          </label>

          {finalKm > rental.initialKm && (
            <div
              className={`rounded p-3 text-sm ${needsMaintenance ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}
            >
              <div className="font-medium">KM Rodados: {kmDriven.toLocaleString()} km</div>
              {needsMaintenance && (
                <div className="mt-1 text-xs">
                  ⚠️ Veículo pode precisar de manutenção (mais de 5.000 km)
                </div>
              )}
            </div>
          )}

          <label className="text-sm">
            <div className="mb-1 font-medium text-gray-700">Observações sobre o veículo</div>
            <textarea
              className="w-full rounded border border-gray-300 p-2"
              rows={3}
              placeholder="Condições do veículo, danos, limpeza, etc."
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
              disabled={!form.formState.isValid || finalKm <= rental.initialKm}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Confirmar Devolução
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
