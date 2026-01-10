"use client";

import { X } from "lucide-react";

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  driverId?: string;
}

export function DriverFormModal({ isOpen, onClose, mode, driverId }: DriverFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === "create" ? "➕ Novo Motorista" : "✏️ Editar Motorista"}
            </h3>
            {mode === "edit" ? <p className="text-xs text-gray-500">ID: {driverId}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500">🚧 Formulário em desenvolvimento (cliques funcionando ✅)</p>
        </div>

        <div className="flex gap-3 border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onClose()}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {mode === "create" ? "Criar Motorista" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
