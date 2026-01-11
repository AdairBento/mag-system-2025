import { api } from "@/lib/api/http";

export default async function DiagnosticoPage() {
  const health = await api<{ status: string; service: string; ts: string }>("/health");

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Diagnóstico</h1>
      <pre className="rounded-md bg-muted p-3 text-sm">{JSON.stringify(health, null, 2)}</pre>
    </div>
  );
}
