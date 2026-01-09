export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-medium text-zinc-900">Painel Administrativo</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          placeholder="Buscar (clientes, veículos, locações...)"
          className="hidden w-[320px] rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 md:block"
        />
        <button className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50">
          Nova Locação
        </button>
      </div>
    </header>
  );
}
