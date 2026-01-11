"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { CNHCategory, Driver } from "@/types/driver";

const schema = z.object({
  name: z.string().min(2, "Informe o nome"),
  cpf: z.string().min(11, "Informe o CPF"),
  cnh: z.string().min(5, "Informe a CNH"),
  cnhCategory: z.enum(["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"]),
  cnhValidade: z.string().min(8, "Informe a validade da CNH"),
  telefone: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO"]),
  clientId: z.string().min(1, "Informe o cliente/empresa"),
});

export type DriverFormData = z.infer<typeof schema>;

type Mode = "create" | "edit";

type Props = {
  companies?: any[];
  open: boolean;
  onClose: () => void;
  mode: Mode;
  title?: string;

  initial?: Partial<Driver> | null;
  onSubmit: (data: DriverFormData) => Promise<void> | void;
};

const DEFAULTS: DriverFormData = {
  name: "",
  cpf: "",
  cnh: "",
  cnhCategory: "B",
  cnhValidade: "",
  telefone: "",
  status: "ATIVO",
  clientId: "",
};

export function DriverFormModal({ open, onClose, mode, title, initial, onSubmit }: Props) {
  const form = useForm<DriverFormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  // ✅ padrão profissional: resetar o form quando abrir/initial mudar
  React.useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      form.reset({
        ...DEFAULTS,
        name: initial.name ?? "",
        cpf: initial.cpf ?? "",
        cnh: initial.cnh ?? "",
        cnhCategory: (initial.cnhCategory as CNHCategory) ?? "B",
        cnhValidade: initial.cnhValidade ?? "",
        telefone: initial.telefone ?? "",
        status: initial.status ?? "ATIVO",
        clientId: initial.clientId ?? "",
      });
      return;
    }

    form.reset(DEFAULTS);
  }, [open, mode, initial, form]);

  const submit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    onClose();
  });

  if (!open) return null;

  const modalTitle = title ?? (mode === "create" ? "➕ Novo Motorista" : "✏️ Editar Motorista");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{modalTitle}</h2>
            <p className="text-xs text-muted-foreground">
              Preencha os dados do motorista (PF). Vincule a um cliente PJ quando aplicável.
            </p>
          </div>

          <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onClose} type="button">
            Fechar
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nome" error={form.formState.errors.name?.message}>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("name")}
              />
            </Field>

            <Field label="CPF" error={form.formState.errors.cpf?.message}>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("cpf")}
              />
            </Field>

            <Field label="CNH" error={form.formState.errors.cnh?.message}>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("cnh")}
              />
            </Field>

            <Field label="Categoria CNH" error={form.formState.errors.cnhCategory?.message}>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("cnhCategory")}
              >
                {["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Validade CNH" error={form.formState.errors.cnhValidade?.message}>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="YYYY-MM-DD"
                {...form.register("cnhValidade")}
              />
            </Field>

            <Field label="Telefone" error={form.formState.errors.telefone?.message}>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("telefone")}
              />
            </Field>

            <Field label="Status" error={form.formState.errors.status?.message}>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("status")}
              >
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
            </Field>

            <Field
              label="Cliente (PJ) / Empresa (clientId)"
              error={form.formState.errors.clientId?.message}
            >
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                {...form.register("clientId")}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button className="rounded-md border px-4 py-2 text-sm" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="rounded-md bg-black px-4 py-2 text-sm text-white" type="submit">
              {mode === "create" ? "Criar Motorista" : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-xs font-medium">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
