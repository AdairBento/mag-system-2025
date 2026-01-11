#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Corretor Profissional de Erros TypeScript - MAG System 2025

.DESCRIPTION
    Corrige automaticamente os erros de tipo identificados no typecheck

.EXAMPLE
    .\scripts\fix-typescript-errors.ps1
    .\scripts\fix-typescript-errors.ps1 -DryRun
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Backup = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Configuração
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$WebSrc = Join-Path $ProjectRoot 'apps' 'web' 'src'
$BackupDir = Join-Path $ProjectRoot '.backups' 'ts-fixes' (Get-Date -Format 'yyyyMMdd_HHmmss')

$Stats = @{ Total = 0; Success = 0; Skipped = 0; Failed = 0 }

# Arquivos
$Files = @{
    ClientsApi = Join-Path $WebSrc 'lib' 'api' 'clients.ts'
    DriversApi = Join-Path $WebSrc 'lib' 'api' 'drivers.ts'
    ClientFilters = Join-Path $WebSrc 'app' '(app)' 'clientes' '_components' 'client-filters.tsx'
    ClientTable = Join-Path $WebSrc 'app' '(app)' 'clientes' '_components' 'client-table.tsx'
    ClientsPage = Join-Path $WebSrc 'app' '(app)' 'clientes' 'page.tsx'
}

# Funções
function Write-Header {
    Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         MAG System 2025 - TypeScript Error Fixer              ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "  🔍 MODO DRY RUN - Nenhuma alteração será aplicada`n" -ForegroundColor Yellow
    }
}

function Write-Step { param($M) $Stats.Total++; Write-Host "[$($Stats.Total)] $M" -ForegroundColor White }
function Write-OK { param($M) Write-Host "  ✓ $M" -ForegroundColor Green; $Stats.Success++ }
function Write-Skip { param($M) Write-Host "  ○ $M" -ForegroundColor Gray; $Stats.Skipped++ }
function Write-Err { param($M) Write-Host "  ✗ $M" -ForegroundColor Red; $Stats.Failed++ }

function Backup-File {
    param($Path)
    if (-not $Backup) { return }
    $rel = $Path.Replace($ProjectRoot, '').TrimStart('\')
    $dst = Join-Path $BackupDir $rel
    New-Item -ItemType Directory -Path (Split-Path $dst) -Force | Out-Null
    Copy-Item $Path $dst -Force
}

function Update-File {
    param($Path, $Desc, $Transform)
    Write-Step $Desc
    
    if (-not (Test-Path $Path)) {
        Write-Err "Arquivo não encontrado: $Path"
        return
    }
    
    try {
        $content = Get-Content $Path -Raw -Encoding UTF8
        $new = & $Transform $content
        
        if ($content -eq $new) {
            Write-Skip "Sem alterações necessárias"
            return
        }
        
        if ($DryRun) {
            Write-Host "  ⚠ [DRY RUN] Alterações detectadas mas não aplicadas" -ForegroundColor Yellow
            return
        }
        
        Backup-File $Path
        Set-Content $Path $new -NoNewline -Encoding UTF8
        Write-OK "Aplicado com sucesso"
    }
    catch {
        Write-Err "Erro: $_"
    }
}

# Correções
function Fix-All {
    # 1. Exportar tipos em clients.ts
    Update-File $Files.ClientsApi "Exportar tipos Client e ClientFilters em clients.ts" {
        param($c)
        # Client e ClientFilters já têm export, então verifica se está correto
        # Se por algum motivo não estiver, adiciona
        if ($c -match 'type Client = \{' -and $c -notmatch 'export type Client') {
            $c = $c -replace 'type Client = \{', 'export type Client = {'
        }
        if ($c -match 'type ClientFilters = \{' -and $c -notmatch 'export type ClientFilters') {
            $c = $c -replace 'type ClientFilters = \{', 'export type ClientFilters = {'
        }
        $c
    }
    
    # 2. Adicionar tipos no drivers.ts
    Update-File $Files.DriversApi "Adicionar CreateDriverPayload e UpdateDriverPayload" {
        param($c)
        if ($c -notmatch 'CreateDriverPayload') {
            $c = $c.TrimEnd() + "`n`n// Payload types for create and update operations`n"
            $c += "export type CreateDriverPayload = Partial<Driver>;`n"
            $c += "export type UpdateDriverPayload = Partial<Driver>;`n"
        }
        $c
    }
    
    # 3. Exportar ClientFiltersBar
    Update-File $Files.ClientFilters "Exportar componente como ClientFiltersBar" {
        param($c)
        if ($c -notmatch 'ClientFiltersBar') {
            $c = $c.TrimEnd() + "`n`n// Export alias for backward compatibility`n"
            $c += "export { ClientFilters as ClientFiltersBar };`n"
        }
        $c
    }
    
    # 4. Corrigir page.tsx
    Update-File $Files.ClientsPage "Corrigir imports e uso de componentes em page.tsx" {
        param($c)
        
        # Import ClientFiltersBar em vez de ClientFilters
        $c = $c -replace "import\s*\{\s*ClientFilters\s*\}\s*from\s*['""]\./_components/client-filters['""]",
            "import { ClientFiltersBar } from './_components/client-filters'"
        
        # Usar ClientFiltersBar no JSX
        $c = $c -replace '<ClientFilters\s', '<ClientFiltersBar '
        
        # Adicionar imports de types do drivers
        if ($c -match "import.*from\s*['""]@/lib/api/drivers['""]" -and $c -notmatch 'CreateDriverPayload') {
            $c = $c -replace "(import\s*\{[^}]+)(}\s*from\s*['""]@/lib/api/drivers['""])",
                '$1, CreateDriverPayload, UpdateDriverPayload$2'
        }
        
        # Corrigir useMemo - substituir clients && clients.filter por ternário
        $c = $c -replace '(useMemo\(\(\)\s*=>\s*)(clients\s*&&\s*clients\.filter)',
            '$1(!clients ? [] : clients.filter'
        
        # Corrigir acessos a .data quando desnecessário
        # Exemplo: result.data?.filter → result?.filter
        $c = $c -replace '(\w+)\.data\?\.(filter|map|find|length)', '$1?.$2'
        
        $c
    }
    
    # 5. Adicionar prop data na interface Props do ClientTable
    Update-File $Files.ClientTable "Adicionar propriedade 'data' na interface Props" {
        param($c)
        
        # Procura a interface Props e adiciona data: Client[]
        if ($c -match '(?s)(interface\s+Props\s*\{)([^}]*?)(\})') {
            $before = $Matches[1]
            $props = $Matches[2]
            $after = $Matches[3]
            
            # Verifica se já tem a propriedade data
            if ($props -notmatch '\bdata\s*:') {
                $props = $props.TrimEnd() + "`n  data: Client[];`n"
                $c = $c -replace '(?s)(interface\s+Props\s*\{)([^}]*?)(\})', "$before$props$after"
            }
        }
        
        $c
    }
}

# Execução
function Main {
    Write-Header
    Fix-All
    
    Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                      RESUMO DA EXECUÇÃO                       ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "  Total de operações:    $($Stats.Total)" -ForegroundColor White
    Write-Host "  Aplicadas com sucesso: $($Stats.Success)" -ForegroundColor Green
    Write-Host "  Sem alterações:        $($Stats.Skipped)" -ForegroundColor Gray
    Write-Host "  Falhas:                $($Stats.Failed)" -ForegroundColor $(if ($Stats.Failed -gt 0) { "Red" } else { "Gray" })
    
    if ($Backup -and -not $DryRun -and $Stats.Success -gt 0) {
        Write-Host "`n  💾 Backups salvos em: .backups\ts-fixes\" -ForegroundColor Cyan
    }
    
    if (-not $DryRun -and $Stats.Success -gt 0) {
        Write-Host "`n  📋 Próximos passos:" -ForegroundColor Yellow
        Write-Host "     1. corepack pnpm -w typecheck" -ForegroundColor Gray
        Write-Host "     2. corepack pnpm -w lint`n" -ForegroundColor Gray
    }
    elseif ($DryRun) {
        Write-Host "`n  💡 Execute sem -DryRun para aplicar as correções`n" -ForegroundColor Cyan
    }
}

try { 
    Main 
}
catch { 
    Write-Host "`n  ✗ Erro fatal: $_`n" -ForegroundColor Red
    exit 1 
}
