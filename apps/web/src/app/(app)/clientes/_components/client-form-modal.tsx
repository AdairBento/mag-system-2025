import React, { useCallback, useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { maskCPF, maskCNPJ, maskPhone } from "@/utils/masks";
import type { Client, ClientType } from "./types";

type ClientUpsertPayload = {
  id?: string;
  type: ClientType;
  name: string;
  email: string;
  phone: string;

  cpf?: string;
  cnpj?: string;
  ie?: string;

  // se quiser no PF
  cnh?: string;
  cnhExpiration?: string;

  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;

  status: "ATIVO";
};

interface Props {
  isOpen: boolean;
  title: string;
  initialData?: Client | null;
  onClose: () => void;
  onSubmit: (payload: ClientUpsertPayload) => void | Promise<void>;
}

type FormState = {
  id: string;
  name: string;
  email: string;
  telefone: string;

  cpf: string;
  cnpj: string;

  // PF
  cnh: string;
  cnhValidade: string;

  // PJ
  ie: string;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

const emptyForm: FormState = {
  id: "",
  name: "",
  email: "",
  telefone: "",
  cpf: "",
  cnpj: "",
  cnh: "",
  cnhValidade: "",
  ie: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

export function ClientFormModal({ isOpen, title, initialData, onClose, onSubmit }: Props) {
  const [clientType, setClientType] = useState<ClientType>("PF");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setClientType(initialData.type ?? "PF");
      setForm({
        id: initialData.id ?? "",
        name: initialData.name ?? "",
        email: initialData.email ?? "",
        telefone: initialData.phone ?? "",

        cpf: initialData.cpf ?? "",
        cnpj: initialData.cnpj ?? "",

        cnh: initialData.cnh ?? "",
        cnhValidade: initialData.cnhExpiration ?? "",

        ie: initialData.ie ?? "",

        cep: initialData.cep ?? "",
        logradouro: initialData.logradouro ?? "",
        numero: initialData.numero ?? "",
        complemento: initialData.complemento ?? "",
        bairro: initialData.bairro ?? "",
        cidade: initialData.cidade ?? "",
        uf: initialData.uf ?? "",
      });
    } else {
      setForm(emptyForm);
      setClientType("PF");
    }
  }, [isOpen, initialData]);

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = (await r.json()) as any;
      if (!data?.erro) {
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          uf: data.uf || "",
        }));
      }
    } catch {
      // silencioso
    }
  }, []);

  const setField = (name: keyof FormState, value: string) =>
    setForm((p) => ({ ...p, [name]: value }));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setField(name as keyof FormState, value);
  };

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => setField("telefone", maskPhone(e.target.value));
  const onCpf = (e: React.ChangeEvent<HTMLInputElement>) => setField("cpf", maskCPF(e.target.value));
  const onCnpj = (e: React.ChangeEvent<HTMLInputElement>) => setField("cnpj", maskCNPJ(e.target.value));

  const onCep = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
    setField("cep", masked);
    if (masked.length === 9) fetchAddressByCep(masked);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const base: Omit<ClientUpsertPayload, "cpf" | "cnpj" | "ie" | "cnh" | "cnhExpiration"> & {
        id?: string;
      } = {
        id: form.id || undefined,
        type: clientType,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.telefone.replace(/\D/g, ""),

        cep: form.cep.replace(/\D/g, ""),
        logradouro: form.logradouro.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim() || undefined,
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        uf: form.uf.toUpperCase().trim(),

        status: "ATIVO",
      };

      const payload: ClientUpsertPayload =
        clientType === "PF"
          ? {
              ...base,
              cpf: form.cpf.replace(/\D/g, "") || undefined,
              cnh: form.cnh.trim() || undefined,
              cnhExpiration: form.cnhValidade || undefined,
            }
          : {
              ...base,
              cnpj: form.cnpj.replace(/\D/g, "") || undefined,
              ie: form.ie.trim() || undefined,
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Cliente *</label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer group">
                <input type="radio" checked={clientType === "PF"} onChange={() => setClientType("PF")} className="w-4 h-4 accent-teal-600" />
                <span className="ml-2 text-gray-700 font-medium group-hover:text-teal-600 transition">Pessoa Física</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input type="radio" checked={clientType === "PJ"} onChange={() => setClientType("PJ")} className="w-4 h-4 accent-teal-600" />
                <span className="ml-2 text-gray-700 font-medium group-hover:text-teal-600 transition">Pessoa Jurídica</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {clientType === "PF" ? "Nome Completo" : "Razão Social"} *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone *</label>
              <input type="tel" name="telefone" value={form.telefone} onChange={onPhone} required maxLength={15} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            {clientType === "PF" ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CPF *</label>
                  <input type="text" name="cpf" value={form.cpf} onChange={onCpf} required maxLength={14} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CNH</label>
                  <input type="text" name="cnh" value={form.cnh} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Validade CNH</label>
                  <input type="date" name="cnhValidade" value={form.cnhValidade} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ *</label>
                  <input type="text" name="cnpj" value={form.cnpj} onChange={onCnpj} required maxLength={18} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Inscrição Estadual</label>
                  <input type="text" name="ie" value={form.ie} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>
              </>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">CEP *</label>
                <input type="text" name="cep" value={form.cep} onChange={onCep} required maxLength={9} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rua *</label>
                <input type="text" name="logradouro" value={form.logradouro} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número *</label>
                <input type="text" name="numero" value={form.numero} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Complemento</label>
                <input type="text" name="complemento" value={form.complemento} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro *</label>
                <input type="text" name="bairro" value={form.bairro} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade *</label>
                <input type="text" name="cidade" value={form.cidade} onChange={onChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">UF *</label>
                <input type="text" name="uf" value={form.uf} onChange={onChange} required maxLength={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50">
              <Save size={18} />
              {loading ? "Salvando..." : "Salvar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
