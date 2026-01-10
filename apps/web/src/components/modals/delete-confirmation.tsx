"use client";

import { X } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  loading?: boolean;
  errorMessage?: string;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  loading = false,
  errorMessage,
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} disabled={loading} className="rounded p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-700">{description}</p>

          {itemName && (
            <div className="rounded bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">{itemName}</p>
            </div>
          )}

          {errorMessage && (
            <div className="rounded bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <p className="text-sm text-gray-500">⚠️ Esta ação não pode ser desfeita!</p>
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
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Excluindo..." : "🗑️ Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
