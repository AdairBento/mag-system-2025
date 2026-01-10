"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  activeTab: "clientes" | "motoristas";
  onTabChange: (tab: "clientes" | "motoristas") => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="inline-flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onTabChange("clientes")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "clientes"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          Clientes
        </button>

        <button
          type="button"
          onClick={() => onTabChange("motoristas")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "motoristas"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          Motoristas
        </button>
      </div>
    </div>
  );
}
