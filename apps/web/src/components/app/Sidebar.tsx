"use client";

import { usePathname } from "next/navigation";

import { NavItem } from "./NavItem";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clientes", label: "Clientes" },
  { href: "/veiculos", label: "Veículos" },
  { href: "/locacoes", label: "Locações" },
  { href: "/financeiro", label: "Financeiro" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-white p-4 md:flex">
      <div className="mb-6">
        <div className="text-lg font-semibold text-zinc-900">MAG</div>
        <div className="text-xs text-zinc-500">Sistema de Locação</div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <NavItem key={it.href} href={it.href} label={it.label} active={pathname === it.href} />
        ))}
      </nav>

      <div className="mt-auto pt-4 text-xs text-zinc-400">v0.1 • Next 16 • Nest 10</div>
    </aside>
  );
}
