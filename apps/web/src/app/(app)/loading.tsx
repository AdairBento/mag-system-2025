export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="mag-card p-4">
        <div className="text-sm text-muted-fg">Carregando...</div>
        <div className="mt-2 h-6 w-56 rounded bg-muted animate-pulse" />
        <div className="mt-4 h-4 w-full rounded bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-2/3 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
