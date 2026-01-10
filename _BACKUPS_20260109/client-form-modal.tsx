"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { Client } from "@/lib/api/clients";

const StatusEnum = z.enum(["ATIVO", "INATIVO", "BLOQUEADO"]);

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("PF"),
    status: StatusEnum,
    name: z.string().min(2, "Nome obrigatÃ³rio"),
    cpf: z.string().min(11, "CPF obrigatÃ³rio"),
    cellphone: z.string().optional(),
    email: z.string().email("E-mail invÃ¡lido").optional().or(z.literal("")),
  }),
  z.object({
    type: z.literal("PJ"),
    status: StatusEnum,
    razaoSocial: z.string().min(2, "RazÃ£o Social obrigatÃ³ria"),
    cnpj: z.string().min(14, "CNPJ obrigatÃ³rio"),
    nomeFantasia: z.string().optional(),
    cellphone: z.string().optional(),
    email: z.string().email("E-mail invÃ¡lido").optional().or(z.literal("")),
  }),
]);

export type ClientFormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void> | void;
  initial?: Client | null;
  title?: string;
};

type ErrorMap = Partial<Record<string, { message?: string }>>;

const DEFAULTS: ClientFormData = {
  type: "PF",
  status: "ATIVO",
  name: "",
  cpf: "",
};

export function ClientFormModal({ open, onClose, onSubmit, initial, title }: Props) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: DEFAULTS,
  });

  const type = useWatch({ control: form.control, name: "type" });
  React.useEffect(() => {
    if (!open) return;

    if (!initial) {
      form.reset(DEFAULTS);
      return;
    }

    if (initial.type === "PF") {
      form.reset({
        type: "PF",
        status: initial.status,
        name: initial.name ?? "",
        cpf: initial.cpf ?? "",
        cellphone: initial.cellphone ?? "",
        email: initial.email ?? "",
      });
    } else {
      form.reset({
        type: "PJ",
        status: initial.status,
        razaoSocial: initial.razaoSocial ?? "",
        cnpj: initial.cnpj ?? "",
        nomeFantasia: initial.nomeFantasia ?? "",
        cellphone: initial.cellphone ?? "",
        email: initial.email ?? "",
      });
    }
  }, [open, initial, form]);

  if (!open) return null;
  const errors = form.formState.errors as unknown as ErrorMap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {title ?? (initial ? "Editar Cliente" : "Novo Cliente")}
          </h2>
          <button className="rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>
            X
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
              <div className="mb-1 font-medium text-gray-700">Tipo</div>
              <select
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("type")}
              >
                <option value="PF">Pessoa FÃ­sica</option>
                <option value="PJ">Pessoa JurÃ­dica</option>
              </select>
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Status</div>
              <select
                className="w-full rounded border border-gray-300 p-2"
                {...form.register("status")}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </label>
          </div>

          {type === "PF" ? (
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2 text-sm">
                <div className="mb-1 font-medium text-gray-700">Nome</div>
                <input
                  className="w-full rounded border border-gray-300 p-2"
                  {...form.register("name")}
                />
                {errors.name?.message ? (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                ) : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">CPF</div>
                <input
                  className="w-full rounded border border-gray-300 p-2"
                  {...form.register("cpf")}
                />
                {errors.cpf?.message ? (
                  <p className="mt-1 text-xs text-red-500">{errors.cpf.message}</p>
                ) : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">Celular</div>
                <input
                  className="w-full rounded border border-gray-300 p-2"
                  {...form.register("cellphone")}
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2 text-sm">
                <div className="mb-1 font-medium text-gray-700">RazÃ£o Social</div>
                <input
                  className="w-full rounded border border-gray-300 p-2"
                  {...form.register("razaoSocial")}
                />
                {errors.razaoSocial?.message ? (
                  <p className="mt-1 text-xs text-red-500">{errors.razaoSocial.message}</p>
                ) : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">CNPJ</div>
                <input
                  className="w-full rounded border border-gray-300 p-2"
                  {...form.register("cnpj")}
                />
                {errors.cnpj?.message ? (
                  <p className="mt-1 text-xs text-red-500">{errors.cnpj.message}</p>
                ) : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">Nome Fantasia</div>
                <input
                  className="w-full rounded border border-gray-300 p-2"
                  {...form.register("nomeFantasia")}
                />
              </label>
            </div>
          )}

          <label className="text-sm">
            <div className="mb-1 font-medium text-gray-700">E-mail</div>
            <input
              className="w-full rounded border border-gray-300 p-2"
              {...form.register("email")}
            />
            {errors.email?.message ? (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            ) : null}
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
