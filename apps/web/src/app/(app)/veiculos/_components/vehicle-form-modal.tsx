"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Vehicle } from "@/lib/api/vehicles";

const StatusEnum = z.enum(["DISPONIVEL", "LOCADO", "MANUTENCAO", "INATIVO"]);

const schema = z.object({
  placa: z.string().min(7, "Placa obrigatoria (minimo 7 caracteres)"),
  marca: z.string().min(2, "Marca obrigatoria"),
  modelo: z.string().min(2, "Modelo obrigatorio"),
  ano: z.coerce.number().min(1900, "Ano invalido").max(new Date().getFullYear() + 1),
  cor: z.string().optional(),
  status: StatusEnum,
  quilometragem: z.coerce.number().min(0, "Quilometragem invalida").optional(),
  renavam: z.string().optional(),
  chassi: z.string().optional(),
});

export type VehicleFormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => Promise<void> | void;
  initial?: Vehicle | null;
  title?: string;
};

const DEFAULTS: VehicleFormData = {
  placa: "",
  marca: "",
  modelo: "",
  ano: new Date().getFullYear(),
  status: "DISPONIVEL",
};

export function VehicleFormModal({ open, onClose, onSubmit, initial, title }: Props) {
  const form = useForm<VehicleFormData>({
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
      placa: initial.placa,
      marca: initial.marca,
      modelo: initial.modelo,
      ano: initial.ano,
      cor: initial.cor ?? "",
      status: initial.status,
      quilometragem: initial.quilometragem ?? undefined,
      renavam: initial.renavam ?? "",
      chassi: initial.chassi ?? "",
    });
  }, [open, initial, form]);

  if (!open) return null;
  const errors = form.formState.errors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {title ?? (initial ? "Editar Veiculo" : "Novo Veiculo")}
          </h2>
          <button className="rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>
            ✕
          </button>
        </div>

        <form
          onSubmit={form.handleSubmit(async (data) => {
            await onSubmit(data);
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Placa *</div>
              <input
                className="w-full rounded border border-gray-300 p-2 uppercase"
                placeholder="ABC1D23"
                maxLength={7}
                {...form.register("placa")}
              />
              {errors.placa?.message && (
                <p className="mt-1 text-xs text-red-500">{errors.placa.message}</p>
              )}
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Status *</div>
              <select
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("status")}
              >
                <option value="DISPONIVEL">Disponivel</option>
                <option value="LOCADO">Locado</option>
                <option value="MANUTENCAO">Manutencao</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Marca *</div>
              <input
                className="w-full rounded border border-gray-300 p-2"
                placeholder="Ex: Toyota, Volkswagen"
                {...form.register("marca")}
              />
              {errors.marca?.message && (
                <p className="mt-1 text-xs text-red-500">{errors.marca.message}</p>
              )}
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Modelo *</div>
              <input
                className="w-full rounded border border-gray-300 p-2"
                placeholder="Ex: Corolla, Gol"
                {...form.register("modelo")}
              />
              {errors.modelo?.message && (
                <p className="mt-1 text-xs text-red-500">{errors.modelo.message}</p>
              )}
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Ano *</div>
              <input
                type="number"
                className="w-full rounded border border-gray-300 p-2"
                placeholder="2024"
                {...form.register("ano")}
              />
              {errors.ano?.message && (
                <p className="mt-1 text-xs text-red-500">{errors.ano.message}</p>
              )}
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Cor</div>
              <input
                className="w-full rounded border border-gray-300 p-2"
                placeholder="Ex: Preto, Branco"
                {...form.register("cor")}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Quilometragem</div>
              <input
                type="number"
                className="w-full rounded border border-gray-300 p-2"
                placeholder="50000"
                {...form.register("quilometragem")}
              />
              {errors.quilometragem?.message && (
                <p className="mt-1 text-xs text-red-500">{errors.quilometragem.message}</p>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Renavam</div>
              <input
                className="w-full rounded border border-gray-300 p-2"
                placeholder="11 digitos"
                maxLength={11}
                {...form.register("renavam")}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Chassi</div>
              <input
                className="w-full rounded border border-gray-300 p-2 uppercase"
                placeholder="17 caracteres"
                maxLength={17}
                {...form.register("chassi")}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
