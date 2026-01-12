import React, { useEffect, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import { maskCPF, maskPhone } from "@/utils/masks";
import type { Client, Driver } from "./types";

type DriverUpsertPayload = {
  id?: string;
  name: string;
  cpf: string;
  telefone?: string;

  cnh: string;
  cnhCategory?: string;
  cnhExpiration?: string;

  status: "ATIVO" | "INATIVO";
  clientId: string;
};

interface Props {
  isOpen: boolean;
  title: string;
  initialData?: Driver | null;
  clients: Client[]; // PJ only
  onClose: () => void;
  onSubmit: (payload: DriverUpsertPayload) => void | Promise<void>;
}

type FormState = {
  id: string;
  name: string;
  cpf: string;
  telefone: string;

  cnh: string;
  cnhCategory: string;
  cnhValidade: string;

  status: "ATIVO" | "INATIVO";
  clientId: string;
};

const emptyForm: FormState = {
  id: "",
  name: "",
  cpf: "",
  telefone: "",
  cnh: "",
  cnhCategory: "",
  cnhValidade: "",
  status: "ATIVO",
  clientId: "",
};

export function DriverFormModal({ isOpen, title, initialData, clients, onClose, onSubmit }: Props) {
  const defaultClientId = useMemo(() => clients?.[0]?.id ?? "", [clients]);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        id: initialData.id ?? "",
        name: initialData.name ?? "",
        cpf: initialData.cpf ?? "",
        telefone: initialData.telefone ?? "",

        cnh: initialData.cnh ?? "",
        cnhCategory: initialData.cnhCategory ?? "",
        cnhValidade: initialData.cnhExpiration ?? "",

        status: initialData.status ?? "ATIVO",
        clientId: initialData.clientId ?? defaultClientId,
      });
    } else {
      setForm({ ...emptyForm, clientId: defaultClientId });
    }
  }, [isOpen, initialData, defaultClientId]);

  const setField = (name: keyof FormState, value: string) => setForm((p) => ({ ...p, [name]: value }));
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setField(name as keyof FormState, value);
  };

  const onCpf = (e: React.ChangeEvent<HTMLInputElement>) => setField("cpf", maskCPF(e.target.value));
  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => setField("telefone", maskPhone(e.target.value));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: DriverUpsertPayload = {
        id: form.id || undefined,
        name: form.name.trim(),
        cpf: form.cpf.replace(/\D/g, ""),
        telefone: form.telefone.replace(/\D/g, "") || undefined,

        cnh: form.cnh.trim(),
        cnhCategory: form.cnhCategory.trim() || undefined,
        cnhExpiration: form.cnhValidade || undefined,

        status: form.status,
        clientId: form.clientId,
      };

      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
              <input name="name" value={form.name} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">CPF *</label>
              <input name="cpf" value={form.cpf} onChange={onCpf} required maxLength={14} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
              <input name="telefone" value={form.telefone} onChange={onPhone} maxLength={15} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">CNH *</label>
              <input name="cnh" value={form.cnh} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
              <input name="cnhCategory" value={form.cnhCategory} onChange={onChange} placeholder="A, B, AB..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Validade CNH</label>
              <input type="date" name="cnhValidade" value={form.cnhValidade} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Empresa (PJ) *</label>
              <select name="clientId" value={form.clientId} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50">
              <Save size={18} />
              {loading ? "Salvando..." : "Salvar Motorista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
