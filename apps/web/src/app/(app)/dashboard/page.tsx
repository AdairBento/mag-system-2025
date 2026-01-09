export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {["Faturamento hoje", "Aluguéis ativos", "Ticket médio", "Inadimplência"].map((t) => (
          <div key={t} className="rounded-lg border bg-white p-4">
            <div className="text-xs text-zinc-500">{t}</div>
            <div className="mt-2 text-2xl font-semibold text-zinc-900">—</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-4 text-sm text-zinc-600">
        Próximos vencimentos e avisos vão entrar aqui.
      </div>
    </div>
  );
}
