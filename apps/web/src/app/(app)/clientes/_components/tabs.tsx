// apps/web/src/app/(app)/clientes/_components/tabs.tsx
"use client";

type TabKey = "clients" | "drivers";

export function Tabs({ value, onChange }: { value: TabKey; onChange: (v: TabKey) => void }) {
  return (
    <div className="inline-flex rounded-lg border bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("clients")}
        className={`rounded-md px-3 py-1.5 text-sm ${
          value === "clients" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Clientes
      </button>
      <button
        type="button"
        onClick={() => onChange("drivers")}
        className={`rounded-md px-3 py-1.5 text-sm ${
          value === "drivers" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Motoristas
      </button>
    </div>
  );
}
