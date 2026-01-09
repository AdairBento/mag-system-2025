"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <div className="mag-card p-4">
        <div className="text-sm text-muted-fg">Ocorreu um erro</div>
        <div className="mt-2 text-lg font-semibold">Não foi possível carregar a página.</div>
        <div className="mt-2 text-xs text-muted-fg break-words">{error.message}</div>
        <div className="mt-4 flex gap-2">
          <button className="mag-btn-primary" onClick={() => reset()}>
            Tentar novamente
          </button>
          <a className="mag-btn-ghost" href="/dashboard">
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
