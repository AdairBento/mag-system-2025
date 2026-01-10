"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { menu, iconColors } from "@/app/(app)/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-center border-b border-gray-800">
        <span className="text-lg font-bold">MAG WebApp</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm">
        {menu.map((entry, index) => {
          if (entry.type === "group") {
            return (
              <p
                key={`group-${index}`}
                className="mb-1 mt-3 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400"
              >
                {entry.label}
              </p>
            );
          }

          const active = pathname === entry.href || pathname.startsWith(entry.href + "/");
          const Icon = entry.icon;
          const colorClass = iconColors[entry.href] ?? "text-indigo-300";

          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 font-medium transition-colors ${
                active ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon size={18} className={colorClass} />
              <span>{entry.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - Botão Sair */}
      <button
        onClick={() => console.log("Logout")}
        className="m-3 flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        <LogOut size={16} />
        <span>Sair</span>
      </button>
    </div>
  );
}
