"use client";

import { useMemo, useState } from "react";
import type { Driver } from "@/types/driver";

type CompanyOption = { id: string; label: string };

export function MigrateDriverModal({
  open,
  driver,
  companies,
  onClose,
  onConfirm,
}: {
  open: boolean;
  driver: Driver | null;
  companies: CompanyOption[];
  onClose: () => void;
  onConfirm: (args: { driverId?: string; newClientId: string }) => void | Promise<void>;
}) {
  const [newClientId, setNewClientId] = useState("");
  const [loading, setLoading] = useState(false);

  const canConfirm = useMemo(
    () => !!driver?.id && !!newClientId && newClientId !== driver.clientId,
    [driver, newClientId],
  );

  const currentCompany = useMemo(
    () => companies.find((c) => c.id === driver?.clientId),
    [companies, driver],
  );

  const newCompany = useMemo(
    () => companies.find((c) => c.id === newClientId),
    [companies, newClientId],
  );

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setLoading(true);
    try {
      await onConfirm({ driverId: driver!.id, newClientId });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg animate-fade-in">
        {/* Header */}
        <div className="border-b p-4 bg-gradient-to-r from-teal-600 to-teal-700">
          <h2 className="text-base font-semibold text-white">Migrar Motorista</h2>
          <p className="text-xs text-teal-100 mt-1">Transferir motorista para outra empresa</p>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Info do motorista */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Motorista:</span>{" "}
              <span className="text-gray-900">{driver.name}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">CPF:</span> {driver.cpf}
            </p>
          </div>

          {/* Empresa atual */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Empresa atual</label>
            <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              <span className="text-sm text-blue-900 font-medium">
                {currentCompany?.label || "Sem vínculo"}
              </span>
            </div>
          </div>

          {/* Nova empresa */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nova empresa (PJ) *
            </label>
            <select
              className="mt-1 h-9 w-full rounded-md border px-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione a nova empresa…</option>
              {companies
                .filter((c) => c.id !== driver.clientId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Preview da migração */}
          {newCompany && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800">
                <span className="font-semibold">✓ Migração:</span>{" "}
                {currentCompany?.label || "Sem vínculo"} → {newCompany.label}
              </p>
            </div>
          )}

          {/* Aviso */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ Esta ação transfere o motorista para outra empresa. Use apenas quando necessário
              mudar o vínculo empresarial.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t p-4">
          <button
            className="h-9 rounded-md border px-3 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            disabled={!canConfirm || loading}
            className={`h-9 rounded-md px-4 text-sm font-medium text-white transition-colors ${
              canConfirm && !loading
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleConfirm}
          >
            {loading ? "Migrando..." : "Confirmar Migração"}
          </button>
        </div>
      </div>
    </div>
  );
}
