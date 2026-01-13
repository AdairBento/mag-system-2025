import React, { useCallback, useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { maskCPF, maskCNPJ, maskPhone } from "@/utils/masks";
import { toast } from "sonner";
import type { Client, ClientType } from "@/types/client";

type ClientUpsertPayload = {
  id?: string;
  type: ClientType;
  name: string;
  email: string;
  phone: string;
  doc: string;

  // PF
  cpf?: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiration: string;

  // PJ
  cnpj?: string;
  ie?: string;
  responsibleName?: string;
  responsiblePhone?: string;

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
  doc: string;

  // PF
  cpf: string;
  cnh: string;
  cnhCategory: string;
  cnhValidade: string;

  // PJ
  cnpj: string;
  ie: string;
  responsibleName: string;
  responsiblePhone: string;

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
  doc: "",
  cpf: "",
  cnh: "",
  cnhCategory: "",
  cnhValidade: "",
  cnpj: "",
  ie: "",
  responsibleName: "",
  responsiblePhone: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

const CNH_CATEGORIES = ["A", "B", "AB", "C", "D", "E", "AC", "AD", "AE"] as const;
type CnhCategory = (typeof CNH_CATEGORIES)[number];

export function ClientFormModal({ isOpen, title, initialData, onClose, onSubmit }: Props) {
  const [clientType, setClientType] = useState<ClientType>("PF");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const cpf = initialData.cpf ?? "";
      const cnpj = initialData.cnpj ?? "";

      setClientType(initialData.type ?? "PF");
      setForm({
        id: initialData.id ?? "",
        name: initialData.name ?? "",
        email: initialData.email ?? "",
        telefone: initialData.phone ?? "",

        doc: (cpf || cnpj || "").replace(/\D/g, ""),

        cpf,
        cnh: initialData.cnh ?? "",
        cnhCategory: initialData.cnhCategory ?? "",
        cnhValidade: initialData.cnhExpiration ?? "",

        cnpj,
        ie: initialData.ie ?? "",
        responsibleName: initialData.responsibleName ?? "",
        responsiblePhone: initialData.responsiblePhone ?? "",

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

  const setField = (name: keyof FormState, value: string) =>
    setForm((p) => ({ ...p, [name]: value }));

  const updateDocField = (cpf: string, cnpj: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    const cleanCnpj = cnpj.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, doc: cleanCpf || cleanCnpj || "" }));
  };

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = (await r.json()) as Record<string, unknown>;
      if (!data?.erro) {
        setForm((prev) => ({
          ...prev,
          logradouro: String(data.logradouro ?? ""),
          bairro: String(data.bairro ?? ""),
          cidade: String(data.localidade ?? ""),
          uf: String(data.uf ?? ""),
        }));
      }
    } catch {
      // silencioso
    }
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setField(name as keyof FormState, value);

    if (name === "cpf" || name === "cnpj") {
      const cpf = name === "cpf" ? value : form.cpf;
      const cnpj = name === "cnpj" ? value : form.cnpj;
      updateDocField(cpf, cnpj);
    }
  };

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    setField("telefone", maskPhone(e.target.value));

  const onResponsiblePhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    setField("responsiblePhone", maskPhone(e.target.value));

  const onCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setField("cpf", masked);
    updateDocField(masked, form.cnpj);
  };

  const onCnpj = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    setField("cnpj", masked);
    updateDocField(form.cpf, masked);
  };

  const onCep = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
    setField("cep", masked);
    if (masked.length === 9) fetchAddressByCep(masked);
  };

  const autoDetectCnhCategory = (raw: string): CnhCategory | "" => {
    const upper = raw.toUpperCase();

    if (upper.includes("AB")) return "AB";
    if (upper.includes("AC")) return "AC";
    if (upper.includes("AD")) return "AD";
    if (upper.includes("AE")) return "AE";
    if (upper.includes("A")) return "A";
    if (upper.includes("B")) return "B";
    if (upper.includes("C")) return "C";
    if (upper.includes("D")) return "D";
    if (upper.includes("E")) return "E";

    return "AB";
  };

  const isValid = () => {
    if (!form.name.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.telefone.replace(/\D/g, "")) return false;
    if (!form.doc) return false;

    const cepOk = form.cep.replace(/\D/g, "").length === 8;
    if (
      !cepOk ||
      !form.logradouro.trim() ||
      !form.numero.trim() ||
      !form.bairro.trim() ||
      !form.cidade.trim() ||
      form.uf.trim().length !== 2
    ) {
      return false;
    }

    if (clientType === "PF") {
      if (!form.cpf.replace(/\D/g, "")) return false;
      if (!form.cnh.trim()) return false;
      if (!form.cnhCategory.trim()) return false;
      if (!form.cnhValidade) return false;
      return true;
    }

    // PJ
    if (!form.cnpj.replace(/\D/g, "")) return false;
    if (!form.responsibleName.trim()) return false;
    if (!form.responsiblePhone.replace(/\D/g, "")) return false;
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;

    setLoading(true);

    try {
      const base = {
        id: form.id || undefined,
        type: clientType,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.telefone.replace(/\D/g, ""),
        doc: form.doc,

        cep: form.cep.replace(/\D/g, ""),
        logradouro: form.logradouro.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim() || undefined,
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        uf: form.uf.toUpperCase().trim(),

        status: "ATIVO" as const,
      };

      const payload: ClientUpsertPayload =
        clientType === "PF"
          ? {
              ...base,
              cpf: form.cpf.replace(/\D/g, "") || undefined,
              cnh: form.cnh.trim(),
              cnhCategory: form.cnhCategory,
              cnhExpiration: form.cnhValidade,
            }
          : {
              ...base,
              cnpj: form.cnpj.replace(/\D/g, "") || undefined,
              ie: form.ie.trim() || undefined,
              responsibleName: form.responsibleName.trim(),
              responsiblePhone: form.responsiblePhone.replace(/\D/g, ""),
              cnh: "",
              cnhCategory: "",
              cnhExpiration: "",
            };

      await onSubmit(payload);

      toast.success(
        form.id ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!",
        {
          description: `${form.name} foi ${form.id ? "atualizado" : "cadastrado"} no sistema MAG.`,
          duration: 4000,
        },
      );

      onClose();
    } catch (error: unknown) {
      console.error("❌ Erro ao salvar cliente:", error);

      toast.error("Erro ao salvar cliente", {
        description: error?.message || "Tente novamente",
        duration: 5000,
      });
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
          {/* Tipo de Cliente */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de Cliente *
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  checked={clientType === "PF"}
                  onChange={() => setClientType("PF")}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="ml-2 text-gray-700 font-medium group-hover:text-teal-600 transition">
                  Pessoa Física
                </span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  checked={clientType === "PJ"}
                  onChange={() => setClientType("PJ")}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="ml-2 text-gray-700 font-medium group-hover:text-teal-600 transition">
                  Pessoa Jurídica
                </span>
              </label>
            </div>
          </div>

          {/* Dados básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {clientType === "PF" ? "Nome Completo" : "Razão Social"} *
              </label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone *</label>
              <input
                type="tel"
                name="telefone"
                autoComplete="tel"
                value={form.telefone}
                onChange={onPhone}
                required
                maxLength={15}
                placeholder="(31) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* PF x PJ específicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientType === "PF" ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    autoComplete="off"
                    value={form.cpf}
                    onChange={onCpf}
                    required
                    maxLength={14}
                    placeholder="123.456.789-00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CNH *</label>
                  <input
                    type="text"
                    name="cnh"
                    autoComplete="off"
                    value={form.cnh}
                    onChange={(e) => {
                      const value = e.target.value;
                      setField("cnh", value);
                      const auto = autoDetectCnhCategory(value);
                      setField("cnhCategory", auto);
                    }}
                    required
                    placeholder="Número da CNH"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Categoria CNH (auto) *
                  </label>
                  <select
                    name="cnhCategory"
                    value={form.cnhCategory}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {CNH_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Validade CNH *
                  </label>
                  <input
                    type="date"
                    name="cnhValidade"
                    value={form.cnhValidade}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ *</label>
                  <input
                    type="text"
                    name="cnpj"
                    autoComplete="off"
                    value={form.cnpj}
                    onChange={onCnpj}
                    required
                    maxLength={18}
                    placeholder="12.345.678/0001-95"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    name="ie"
                    autoComplete="off"
                    value={form.ie}
                    onChange={onChange}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Responsável *
                  </label>
                  <input
                    type="text"
                    name="responsibleName"
                    autoComplete="name"
                    value={form.responsibleName}
                    onChange={onChange}
                    required
                    placeholder="Nome do responsável"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Telefone Responsável *
                  </label>
                  <input
                    type="tel"
                    name="responsiblePhone"
                    autoComplete="tel"
                    value={form.responsiblePhone}
                    onChange={onResponsiblePhone}
                    required
                    maxLength={15}
                    placeholder="(31) 99999-9999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>

          {/* Endereço */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">CEP *</label>
                <input
                  type="text"
                  name="cep"
                  autoComplete="postal-code"
                  value={form.cep}
                  onChange={onCep}
                  required
                  maxLength={9}
                  placeholder="12345-678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rua *</label>
                <input
                  type="text"
                  name="logradouro"
                  autoComplete="street-address"
                  value={form.logradouro}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número *</label>
                <input
                  type="text"
                  name="numero"
                  autoComplete="off"
                  value={form.numero}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complemento"
                  autoComplete="off"
                  value={form.complemento}
                  onChange={onChange}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  autoComplete="address-level3"
                  value={form.bairro}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade *</label>
                <input
                  type="text"
                  name="cidade"
                  autoComplete="address-level2"
                  value={form.cidade}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">UF *</label>
                <input
                  type="text"
                  name="uf"
                  autoComplete="address-level1"
                  value={form.uf}
                  onChange={onChange}
                  required
                  maxLength={2}
                  placeholder="MG"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !isValid()}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {loading ? "Salvando..." : "Salvar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
