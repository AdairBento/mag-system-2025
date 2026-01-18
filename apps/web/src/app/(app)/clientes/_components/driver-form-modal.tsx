import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { maskCPF, maskPhone } from "@/utils/masks";
import { toast } from "sonner";
import { toApiLikeError, getErrorMessage } from "@/lib/api-error-helper";
import type { Driver, CNHCategory } from "@/types/driver";

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Driver) => void | Promise<void>;
  initialData?: Driver | null;
  title: string;
  clients?: Array<{ id: string; name: string; type: string }>;
}

type FormState = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  cnh: string;
  cnhCategory: string;
  cnhValidade: string;
  telefone: string;
  clientId: string;
  status: "ATIVO" | "INATIVO";
};

const emptyForm: FormState = {
  id: "",
  name: "",
  cpf: "",
  email: "",
  cnh: "",
  cnhCategory: "",
  cnhValidade: "",
  telefone: "",
  clientId: "",
  status: "ATIVO",
};

const CNH_CATEGORIES = ["A", "B", "AB", "C", "D", "E", "AC", "AD", "AE"] as const;
type CnhCategory = (typeof CNH_CATEGORIES)[number];

export function DriverFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  clients = [],
}: DriverFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [conflictData, setConflictData] = useState<{
    driver: {
      id: string;
      name: string;
      cpf: string;
      currentClient?: string;
    };
  } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        id: initialData.id ?? "",
        name: initialData.name ?? "",
        cpf: initialData.cpf ?? "",
        email: initialData.email ?? "",
        cnh: initialData.cnh ?? "",
        cnhCategory: initialData.cnhCategory ?? "",
        cnhValidade: formatDateForInput(initialData.cnhValidade),
        telefone: initialData.telefone ?? "",
        clientId: initialData.clientId ?? "",
        status: initialData.status ?? "ATIVO",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, initialData]);

  const setField = (name: keyof FormState, value: string) =>
    setForm((p) => ({ ...p, [name]: value }));

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

    return "AB"; // default MAG (moto + carro)
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setField(name as keyof FormState, value);
  };

  const onCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setField("cpf", masked);
  };

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    setField("telefone", masked);
  };

  const onCnhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setField("cnh", value);
    const auto = autoDetectCnhCategory(value);
    setField("cnhCategory", auto);
  };

  const isValid = (): boolean => {
    if (!form.name.trim()) return false;
    if (!form.cpf.replace(/\D/g, "")) return false;
    if (!form.cnh.trim()) return false;
    if (!form.cnhCategory.trim()) return false;
    if (!form.cnhValidade) return false;
    if (!form.telefone.replace(/\D/g, "")) return false;
    if (!form.clientId) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;

    setLoading(true);

    try {
      const driverData: Driver = {
        ...(form.id && { id: form.id }),
        name: form.name.trim(),
        cpf: form.cpf.replace(/\D/g, ""),
        email: form.email.trim() || undefined,
        cnh: form.cnh.trim(),
        cnhCategory: form.cnhCategory as CNHCategory | null,
        cnhValidade: form.cnhValidade,
        telefone: form.telefone.replace(/\D/g, ""),
        clientId: form.clientId,
        status: form.status,
      };

      await onSubmit(driverData);
      onClose();
    } catch (err: unknown) {
      console.error("❌ Erro ao salvar motorista:", err);

      const apiErr = toApiLikeError(err);
      const status = apiErr.response?.status ?? apiErr.status;
      const details = apiErr.response?.data ?? apiErr.details;

      const detailsObj =
        typeof details === "object" && details !== null
          ? (details as Record<string, unknown>)
          : null;

      const hasDriver = !!detailsObj?.driver;

      console.log("🔍 Debug erro:", { status, details, hasDriver });

      if (status === 409 && hasDriver) {
        setConflictData(
          detailsObj as unknown as {
            driver: {
              id: string;
              name: string;
              cpf: string;
              currentClient?: string;
            };
          },
        );
        setShowTransferModal(true);
      } else {
        const message =
          apiErr.message ??
          (detailsObj && typeof detailsObj.message === "string"
            ? detailsObj.message
            : getErrorMessage(err));

        toast.error("Erro ao salvar motorista", {
          description: message,
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      setLoading(true);
      setShowTransferModal(false);

      // ✅ Usar URL correta para a API
      const response = await fetch(
        `http://localhost:3001/drivers/${conflictData?.driver?.id ?? ""}/migrate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newClientId: form.clientId,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao migrar motorista");
      }

      toast.success("Motorista migrado com sucesso!", {
        description: `${conflictData?.driver?.name ?? ""} agora está vinculado a este cliente.`,
        duration: 4000,
      });

      onClose();
      setConflictData(null);

      // ✅ Recarregar dados
      if (window.location.pathname.includes("/clientes")) {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err: unknown) {
      console.error("❌ Erro ao salvar motorista:", err);

      const apiErr = toApiLikeError(err);
      const status = apiErr.response?.status ?? apiErr.status;
      const details = apiErr.response?.data ?? apiErr.details;

      const detailsObj =
        typeof details === "object" && details !== null
          ? (details as Record<string, unknown>)
          : null;

      const hasDriver = !!detailsObj?.driver;

      console.log("🔍 Debug erro:", { status, details, hasDriver });

      if (status === 409 && hasDriver) {
        setConflictData(
          detailsObj as unknown as {
            driver: {
              id: string;
              name: string;
              cpf: string;
              currentClient?: string;
            };
          },
        );
        setShowTransferModal(true);
      } else {
        const message =
          apiErr.message ??
          (detailsObj && typeof detailsObj.message === "string"
            ? detailsObj.message
            : getErrorMessage(err));

        toast.error("Erro ao salvar motorista", {
          description: message,
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransfer = () => {
    setShowTransferModal(false);
    setConflictData(null);
    setLoading(false);
  };

  if (!isOpen) return null;

  const pjClients = clients.filter((c) => c.type === "PJ");

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
              <X size={24} className="text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="João Silva"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  value={form.cpf}
                  onChange={onCpf}
                  required
                  maxLength={14}
                  placeholder="123.456.789-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={form.telefone}
                  onChange={onPhone}
                  required
                  maxLength={15}
                  placeholder="(31) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="joao@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* CNH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CNH *</label>
                <input
                  type="text"
                  name="cnh"
                  value={form.cnh}
                  onChange={onCnhChange}
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

              <div className="md:col-span-2">
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
            </div>

            {/* Empresa */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vínculo Empresarial</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Empresa/Cliente (PJ) *
                </label>
                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione uma empresa PJ</option>
                  {pjClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Motoristas devem estar vinculados a uma empresa (Pessoa Jurídica)
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            {/* Botões */}
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
                {loading ? "Salvando..." : "Salvar Motorista"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL DE TRANSFERÊNCIA */}
      {showTransferModal && conflictData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Motorista Já Cadastrado</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Nome:</span> {conflictData?.driver?.name ?? ""}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">CPF:</span> {conflictData.driver.cpf}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Empresa atual:</span>{" "}
                {conflictData.driver.currentClient || "Sem vínculo"}
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6">
              <p className="text-sm text-yellow-800">
                Este motorista já existe. Deseja transferi-lo para a nova empresa?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Transferindo..." : "Confirmar Transferência"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
