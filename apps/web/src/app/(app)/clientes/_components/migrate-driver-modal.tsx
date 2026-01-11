// apps/web/src/app/(app)/clientes/_components/migrate-driver-modal.tsx
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
  onConfirm: (args: { driverId: string; newClientId: string }) => void | Promise<void>;
}) {
  const [newClientId, setNewClientId] = useState("");

  const canConfirm = useMemo(() => !!driver?.id && !!newClientId, [driver, newClientId]);

  if (!open || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="border-b p-4">
          <h2 className="text-base font-semibold">Migrar motorista</h2>
          <p className="text-xs text-gray-600">
            Motorista: <span className="font-medium">{driver.name}</span>
          </p>
        </div>

        <div className="p-4">
          <label className="text-xs text-gray-600">Nova empresa (PJ)</label>
          <select
            className="mt-1 h-9 w-full rounded-md border px-2 text-sm"
            value={newClientId}
            onChange={(e) => setNewClientId(e.target.value)}
          >
            <option value="">Selecione…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <p className="mt-3 text-xs text-gray-600">
            Regra: troca de empresa não é via “editar”, é via migração.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-4">
          <button className="h-9 rounded-md border px-3 text-sm hover:bg-gray-50" onClick={onClose}>
            Cancelar
          </button>
          <button
            disabled={!canConfirm}
            className={`h-9 rounded-md px-3 text-sm font-medium text-white ${
              canConfirm ? "bg-gray-900 hover:bg-black" : "bg-gray-300"
            }`}
            onClick={() => onConfirm({ driverId: driver.id, newClientId })}
          >
            Confirmar migração
          </button>
        </div>
      </div>
    </div>
  );
}
