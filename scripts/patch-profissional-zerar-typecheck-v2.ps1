$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}
function To-RelPath([string]$fullPath, [string]$root) {
  $p = [System.IO.Path]::GetFullPath($fullPath)
  $r = [System.IO.Path]::GetFullPath($root)
  if ($p.StartsWith($r)) { return $p.Substring($r.Length).TrimStart('\','/') }
  return [System.IO.Path]::GetFileName($p)
}
function Backup-IfExists([string]$filePath, [string]$backupRoot, [string]$repoRoot) {
  if (Test-Path $filePath) {
    $rel = To-RelPath $filePath $repoRoot
    $dest = Join-Path $backupRoot $rel
    $destDir = Split-Path -Parent $dest
    Ensure-Dir $destDir
    Copy-Item -Force $filePath $dest
  }
}
function Write-FileAtomic([string]$filePath, [string]$content, [string]$backupRoot, [string]$repoRoot) {
  $dir = Split-Path -Parent $filePath
  Ensure-Dir $dir
  Backup-IfExists $filePath $backupRoot $repoRoot
  $tmp = "$filePath.tmp"
  $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($tmp, $content, $utf8NoBom)
  Move-Item -Force $tmp $filePath
}
function Patch-File([string]$filePath, [scriptblock]$patchFn, [string]$backupRoot, [string]$repoRoot) {
  if (-not (Test-Path $filePath)) { throw "Arquivo não encontrado: $filePath" }
  Backup-IfExists $filePath $backupRoot $repoRoot
  $txt = Get-Content $filePath -Raw -Encoding UTF8
  $new = & $patchFn $txt
  if ($new -ne $txt) {
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($filePath, $new, $utf8NoBom)
  }
}

$repoRoot = (Get-Location).Path
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repoRoot ".backups\professional-patch\$ts"
Ensure-Dir $backupRoot

# ------------------------------------------------------------
# 1) Reescrever client-table.tsx (determinístico e sem duplicar rows)
# ------------------------------------------------------------
$clientTablePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\client-table.tsx"

$clientTableContent = @'
// apps/web/src/app/(app)/clientes/_components/client-table.tsx
"use client";

import type { Client } from "@/types/client";

type Props = {
  data: Client[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ClientTable({ data, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">Nenhum cliente encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-left">Doc</th>
            <th className="px-3 py-2 text-left">Telefone</th>
            <th className="px-3 py-2 text-left">Cidade</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="border-b last:border-b-0">
              <td className="px-3 py-2">{c.name}</td>
              <td className="px-3 py-2">{c.doc ?? c.cpf ?? c.cnpj ?? "-"}</td>
              <td className="px-3 py-2">{c.cellphone ?? c.phone ?? "-"}</td>
              <td className="px-3 py-2">{c.city ?? "-"}</td>
              <td className="px-3 py-2">{c.status}</td>
              <td className="px-3 py-2 text-right">
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    className="rounded-md border px-2 py-1 hover:bg-muted"
                    onClick={() => onEdit(c.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded-md border px-2 py-1 hover:bg-muted"
                    onClick={() => onDelete(c.id)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientTable;
'@

Write-FileAtomic $clientTablePath $clientTableContent $backupRoot $repoRoot

# ------------------------------------------------------------
# 2) page.tsx: remover ".data" nos retornos create/update/migrate de driver (objetos {name,cpf,cnh...})
# ------------------------------------------------------------
$pagePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\page.tsx"
Patch-File $pagePath {
  param($t)

  # createDriver(...).data -> createDriver(...)
  $t = $t -replace '(createDriver\([^\)]*\))\.data\b', '$1'
  # updateDriver(id, ...).data -> updateDriver(id, ...)
  $t = $t -replace '(updateDriver\([^\)]*\))\.data\b', '$1'
  # migrateDriver(...).data -> migrateDriver(...)
  $t = $t -replace '(migrateDriver\([^\)]*\))\.data\b', '$1'

  return $t
} $backupRoot $repoRoot

# ------------------------------------------------------------
# 3) driver-form-modal.tsx: eliminar warning no-unused-expressions removendo type CompanyOption e tipando inline
# ------------------------------------------------------------
$driverModalPath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\driver-form-modal.tsx"
if (Test-Path $driverModalPath) {
  Patch-File $driverModalPath {
    param($t)

    # remove type CompanyOption (qualquer variação)
    $t = $t -replace '(?m)^\s*type\s+CompanyOption\s*=\s*\{[^\}]*\};\s*\r?\n', ''

    # trocar companies?: CompanyOption[] / any[] por inline seguro
    $t = $t -replace 'companies\?\s*:\s*CompanyOption\[\]', 'companies?: Array<{ id: string; name?: string; label?: string }>'
    $t = $t -replace 'companies\?\s*:\s*any\[\]', 'companies?: Array<{ id: string; name?: string; label?: string }>'

    return $t
  } $backupRoot $repoRoot
}

Write-Host ""
Write-Host "✅ Patch V2 aplicado (client-table determinístico + remove .data drivers + limpa warning modal)!" -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w typecheck"
Write-Host "  corepack pnpm -w lint"
Write-Host ""
