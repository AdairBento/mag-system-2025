"use client";

import { Menu, Search } from "lucide-react";

type TopbarProps = {
  onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        {/* Menu mobile */}
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Busca global */}
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Busca global (cliente, veículo, locação...)"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>
    </header>
  );
}
