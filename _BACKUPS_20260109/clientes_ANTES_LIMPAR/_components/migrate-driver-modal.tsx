"use client";

import { X, ArrowRight } from "lucide-react";
import { useState } from "react";

interface MigrateDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  driverName: string;
  currentClientName: string;
  onConfirm: (newClientId: string) => Promise<void> | void;
}

export function MigrateDriverModal({
  isOpen,
  onClose,
  driverId,
  driverName,
  currentClientName,
  onConfirm,
}: MigrateDriverModalProps) {
  const [newClientId, setNewClientId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleConfirm() {
    if (!driverId || !newClientId) return;
    setLoading(true);
    try {
      await onConfirm(newClientId);
      setNewClientId("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-semibold text-gray-900">🔄 Migrar Motorista</h3>
            <p className="text-xs text-gray-500">ID: {driverId}</p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              Motorista: <span className="font-bold">{driverName}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-lg border-2 border-gray-300 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Cliente Atual</p>
              <p className="font-medium text-gray-900">{currentClientName}</p>
            </div>

            <ArrowRight className="text-gray-400" size={24} />

            <div className="flex-1">
              <select
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecione o novo cliente</option>
                {/* TODO: carregar lista real de clientes (próximo passo) */}
                <option value="uuid-demo-1">Cliente Demo 1</option>
                <option value="uuid-demo-2">Cliente Demo 2</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ O motorista será transferido para o novo cliente selecionado
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t p-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !newClientId}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Migrando..." : "🔄 Migrar Motorista"}
          </button>
        </div>
      </div>
    </div>
  );
}
