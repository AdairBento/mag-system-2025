// apps/web/src/app/(app)/diagnostico/page.tsx

import { api } from "@/lib/api/http";

type Health = { status: string; service: string; ts: string };

export default async function DiagnosticoPage() {
  let health: Health | null = null;
  let error: unknown = null;

  try {
    health = await api<Health>("/health");
  } catch (err) {
    error = err;
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Diagnóstico</h1>

      {error ? (
        <>
          <p className="text-sm text-destructive">Falha ao consultar /health</p>
          <pre className="rounded-md bg-muted p-3 text-sm">{JSON.stringify(error, null, 2)}</pre>
        </>
      ) : (
        <pre className="rounded-md bg-muted p-3 text-sm">{JSON.stringify(health, null, 2)}</pre>
      )}
    </div>
  );
}
