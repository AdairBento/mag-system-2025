#!/usr/bin/env pwsh
#Requires -Version 7.0

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { New-Item -ItemType Directory -Path $Path | Out-Null }
}

function Backup-File([string]$File) {
  if (Test-Path -LiteralPath $File) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $bak = "$File.bak.$stamp"
    Copy-Item -LiteralPath $File -Destination $bak -Force
    return $bak
  }
  return $null
}

function Write-Utf8NoBom([string]$File, [string]$Content) {
  $dir = Split-Path -Parent $File
  Ensure-Dir $dir
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($File, $Content, $utf8NoBom)
}

$root = (Resolve-Path ".").Path
$file = Join-Path $root "apps\web\src\app\(app)\clientes\_components\client-form-modal.tsx"
if (-not (Test-Path -LiteralPath $file)) { throw "Arquivo não encontrado: $file" }

$bak = Backup-File $file
Write-Host "🧷 Backup:" $bak

$src = Get-Content -LiteralPath $file -Raw

# 1) Injeta select de STATUS logo abaixo do Tipo PF/PJ (se ainda não existir)
if ($src -notmatch 'label.*Status') {
  $src = $src -replace '(?s)(\{\s*/\*\s*Tipo PF/PJ\s*\*/\s*\}.*?\</div\>\s*\</div\>)', ('$1' + @'
          
          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status *</label>
            <select
              value={(form.getValues("status" as any) as any) ?? "ATIVO"}
              onChange={(e) => onMaskedChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="BLOQUEADO">Bloqueado</option>
            </select>
            {errors?.status?.message ? <p className="text-sm text-red-600 mt-1">{errors.status.message}</p> : null}
          </div>
'@))
}

# 2) Garante que phone/cpf/cnpj/cep sejam sempre strings (evita controlled/uncontrolled)
$src = $src -replace 'value=\{\(form\.getValues\("cellphone" as any\) as any\) \?\? ""\}', 'value={String((form.getValues("cellphone" as any) as any) ?? "")}'
$src = $src -replace 'value=\{\(form\.getValues\("cpf" as any\) as any\) \?\? ""\}', 'value={String((form.getValues("cpf" as any) as any) ?? "")}'
$src = $src -replace 'value=\{\(form\.getValues\("cnpj" as any\) as any\) \?\? ""\}', 'value={String((form.getValues("cnpj" as any) as any) ?? "")}'
$src = $src -replace 'value=\{\(form\.getValues\("cep" as any\) as any\) \?\? ""\}', 'value={String((form.getValues("cep" as any) as any) ?? "")}'
$src = $src -replace 'value=\{\(form\.getValues\("uf" as any\) as any\) \?\? ""\}', 'value={String((form.getValues("uf" as any) as any) ?? "")}'

Write-Utf8NoBom $file $src
Write-Host "✅ Patch aplicado:" $file
Write-Host "➡️ Rode: corepack pnpm -w typecheck && corepack pnpm -w lint"
