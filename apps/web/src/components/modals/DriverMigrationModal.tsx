"use client";

import { useState, useEffect } from "react";

interface ExistingDriver {
  id: string;
  name: string;
  clientId: string | null;
  clientName: string | null;
}

interface Client {
  id: string;
  name: string;
}

interface DriverMigrationModalProps {
  isOpen: boolean;
  existingDriver: ExistingDriver | null;
  clients: Client[];
  onConfirm: (driverId: string, newClientId: string | null) => Promise<void>;
  onCancel: () => void;
}

export function DriverMigrationModal({
  isOpen,
  existingDriver,
  clients,
  onConfirm,
  onCancel,
}: DriverMigrationModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state quando modal abre
  useEffect(() => {
    if (isOpen) {
      setSelectedClientId(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !existingDriver) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(existingDriver.id, selectedClientId);
      onCancel(); // Fechar modal após sucesso
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao migrar motorista");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-modal-title"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4">
            <h2 id="migration-modal-title" className="text-xl font-bold text-gray-900">
              ⚠️ Motorista Já Cadastrado
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              O motorista <strong>{existingDriver.name}</strong> já está cadastrado
              {existingDriver.clientName ? (
                <>
                  {" "}
                  na empresa <strong>{existingDriver.clientName}</strong>
                </>
              ) : (
                " como motorista independente"
              )}
              .
            </p>
          </div>

          {/* Formulário */}
          <div className="mb-6">
            <label
              htmlFor="new-client-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Deseja migrar este motorista para outra empresa?
            </label>

            <select
              id="new-client-select"
              value={selectedClientId || ""}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">-- Selecione uma empresa --</option>
              <option value="__independent__">👤 Motorista Independente (sem vínculo)</option>
              {clients
                .filter((c) => c.id !== existingDriver.clientId)
                .map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
            </select>

            {selectedClientId === "__independent__" && (
              <p className="text-xs text-gray-500 mt-2">
                💡 O motorista ficará disponível para qualquer cliente
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirm}
              disabled={!selectedClientId || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Migrando...
                </>
              ) : (
                "Confirmar Migração"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
