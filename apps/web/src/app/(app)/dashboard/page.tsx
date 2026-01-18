"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Visão geral do sistema de locações</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Locações Ativas</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">0</p>
          <p className="mt-1 text-xs text-green-600">+0 hoje</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Veículos Disponíveis</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">0</p>
          <p className="mt-1 text-xs text-zinc-500">de 0 total</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Vencimentos Hoje</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">0</p>
          <p className="mt-1 text-xs text-orange-600">Atenção</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Pagamentos Atrasados</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">0</p>
          <p className="mt-1 text-xs text-red-600">Urgente</p>
        </div>
      </div>

      {/* Próximos Vencimentos */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Próximos Vencimentos</h2>
        <p className="mt-8 text-center text-sm text-zinc-400">
          Tabela de locações com vencimento próximo será implementada...
        </p>
      </div>
    </div>
  );
}
