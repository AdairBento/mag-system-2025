#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Corretor Completo - MAG System 2025
.DESCRIPTION
    Corrige todos os erros TypeScript e recupera arquivos corrompidos
#>

[CmdletBinding()]
param([switch]$DryRun)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$WebSrc = Join-Path $ProjectRoot 'apps' 'web' 'src'

function Write-Header {
    Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║      MAG System 2025 - Correção Completa de Erros TS         ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Update-File {
    param($Path, $Desc, $Content)
    
    Write-Host "  → $Desc" -ForegroundColor White
    
    if ($DryRun) {
        Write-Host "    [DRY RUN] Não aplicado" -ForegroundColor Yellow
        return
    }
    
    if (Test-Path $Path) {
        $backup = "$Path.backup_$(Get-Date -Format 'HHmmss')"
        Copy-Item $Path $backup -Force
    }
    
    Set-Content $Path $Content -NoNewline -Encoding UTF8
    Write-Host "    ✓ Aplicado" -ForegroundColor Green
}

# 1. Restaurar http.ts (se corrompido)
$httpPath = Join-Path $WebSrc 'lib' 'api' 'http.ts'
$httpContent = @'
type ApiError = {
  ok: false;
  status: number;
  code?: string;
  message?: string;
  details?: unknown;
};

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  return envUrl && envUrl.trim() ? envUrl.trim() : "http://localhost:3001";
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as unknown as T;

  const data = await parseBody(res);

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>)["message"])
        : `HTTP ${res.status}`;

    const err: ApiError = {
      ok: false,
      status: res.status,
      message: msg,
      details: data,
    };
    throw err;
  }

  return data as T;
}
'@

# 2. Atualizar drivers.ts
$driversPath = Join-Path $WebSrc 'lib' 'api' 'drivers.ts'
$driversContent = Get-Content $driversPath -Raw -Encoding UTF8
if ($driversContent -notmatch 'CreateDriverPayload') {
    $driversContent = $driversContent.TrimEnd() + @'


// Payload types for create and update operations
export type CreateDriverPayload = Partial<Driver>;
export type UpdateDriverPayload = Partial<Driver>;
'@
}

# 3. Atualizar client-filters.tsx
$filtersPath = Join-Path $WebSrc 'app' '(app)' 'clientes' '_components' 'client-filters.tsx'
$filtersContent = Get-Content $filtersPath -Raw -Encoding UTF8
if ($filtersContent -notmatch 'ClientFiltersBar') {
    $filtersContent = $filtersContent.TrimEnd() + @'


// Export alias for backward compatibility
export { ClientFilters as ClientFiltersBar };
'@
}

# 4. Corrigir page.tsx
$pagePath = Join-Path $WebSrc 'app' '(app)' 'clientes' 'page.tsx'
$pageContent = Get-Content $pagePath -Raw -Encoding UTF8

# Corrigir import
$pageContent = $pageContent -replace `
    "import\s*\{\s*ClientFilters\s*\}\s*from\s*['""]\./_components/client-filters['""]",
    "import { ClientFiltersBar } from './_components/client-filters'"

# Corrigir uso do componente
$pageContent = $pageContent -replace '<ClientFilters\s', '<ClientFiltersBar '

# Adicionar imports de driver types
if ($pageContent -notmatch 'CreateDriverPayload') {
    $pageContent = $pageContent -replace `
        "(import.*)(}\s*from\s*['""]@/lib/api/drivers['""])",
        '$1, CreateDriverPayload, UpdateDriverPayload$2'
}

# Corrigir useMemo - linha 45
$pageContent = $pageContent -replace `
    '(const\s+filtered\s*=\s*useMemo\(\(\)\s*=>\s*)clients\s*&&\s*clients\.filter',
    '$1!clients ? [] : clients.filter'

# Executar
Write-Header

if ($DryRun) {
    Write-Host "  🔍 MODO DRY RUN`n" -ForegroundColor Yellow
}

Update-File $httpPath "Restaurar http.ts" $httpContent
Update-File $driversPath "Adicionar tipos em drivers.ts" $driversContent
Update-File $filtersPath "Exportar ClientFiltersBar" $filtersContent
Update-File $pagePath "Corrigir page.tsx" $pageContent

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    CORREÇÕES CONCLUÍDAS                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

if (-not $DryRun) {
    Write-Host "  📋 Execute agora:" -ForegroundColor Yellow
    Write-Host "     corepack pnpm -w typecheck" -ForegroundColor Gray
    Write-Host "     corepack pnpm -w lint`n" -ForegroundColor Gray
}
