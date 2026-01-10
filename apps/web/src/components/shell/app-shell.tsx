"use client";

import { ReactNode, useState } from "react";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Desktop - w-60 + bg-gray-900 igual ao seu */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 bg-gray-900 text-white shadow-2xl md:block">
        <SidebarNav />
      </aside>

      {/* Sidebar Mobile */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-screen w-60 bg-gray-900 text-white shadow-2xl md:hidden">
            <SidebarNav />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="md:ml-60">
        <Topbar onMenuClick={() => setMobileOpen((v) => !v)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
