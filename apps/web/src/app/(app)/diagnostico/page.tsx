import { apiRequest } from "@/lib/apiClient";

export default async function DiagnosticoPage() {
  const health = await apiRequest<{ status: string; service: string; ts: string }>("/health");

  return (
    <div className="space-y-4">
      <div className="mag-card p-4">
        <div className="text-sm text-muted-fg">Diagnóstico</div>
        <div className="mt-2 text-lg font-semibold">
          API: {health.status.toUpperCase()} • {health.service}
        </div>
        <div className="mt-2 text-xs text-muted-fg">Atualizado: {health.ts}</div>
      </div>

      <div className="mag-card p-4">
        <div className="text-sm font-semibold">O que este teste garante</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-fg space-y-1">
          <li>Contrato de resposta padronizado (data + requestId)</li>
          <li>Conectividade Web ↔ API via apiClient único</li>
          <li>Ambientes via NEXT_PUBLIC_API_URL</li>
        </ul>
      </div>
    </div>
  );
}
