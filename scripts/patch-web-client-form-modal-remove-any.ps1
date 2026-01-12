#!/usr/bin/env pwsh
#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) { 
  if (-not (Test-Path -LiteralPath $Path)) { 
    New-Item -ItemType Directory -Path $Path | Out-Null 
  } 
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

if (-not (Test-Path -LiteralPath $file)) { 
  throw "Arquivo não encontrado: $file" 
}

$bak = Backup-File $file
Write-Host "🧷 Backup: $bak" -ForegroundColor Yellow

$src = Get-Content -LiteralPath $file -Raw

# Insere helpers tipados e substitui o uso de (initial as any) por acesso seguro
if ($src -notmatch "type AnyRecord") {
  $src = $src -replace '(?s)(import type \{ Client \} from "@/types/client";\s*)', ('$1' + @'

type AnyRecord = Record<string, unknown>;
function asRecord(v: unknown): AnyRecord {
  return (v && typeof v === "object") ? (v as AnyRecord) : {};
}
function getStr(obj: AnyRecord, key: string, fallback = ""): string {
  const v = obj[key];
  return typeof v === "string" ? v : fallback;
}
function getStatus(obj: AnyRecord): "ATIVO" | "INATIVO" | "BLOQUEADO" {
  const v = obj["status"];
  if (v === "ATIVO" || v === "INATIVO" || v === "BLOQUEADO") return v;
  return "ATIVO";
}

'@)
}

# Troca os blocos de reset que estão cheios de any
$src = $src -replace '\(\s*initial\s+as\s+any\s*\)\.', "init."
$src = $src -replace '\(\s*initial\s+as\s+any\s*\)', "init"

# Garante que no effect tenha const init
if ($src -match 'React\.useEffect\(\(\) => \{\s*if \(!open\) return;' -and $src -notmatch 'const init = asRecord\(initial\)') {
  $src = $src -replace '(React\.useEffect\(\(\) => \{\s*if \(!open\) return;\s*)', ('$1' + "const init = asRecord(initial);`n")
}

# Ajusta campos chave dentro do reset para usar getStr/getStatus
$src = $src -replace 'status:\s*\(initial.*?\)\s*\?\?\s*"ATIVO"', 'status: getStatus(init)'
$src = $src -replace 'status:\s*\(init\)\.status\s*\?\?\s*"ATIVO"', 'status: getStatus(init)'

$src = $src -replace 'name:\s*init\.name\s*\?\?\s*""', 'name: getStr(init, "name")'
$src = $src -replace 'cpf:\s*init\.cpf\s*\?\?\s*init\.doc\s*\?\?\s*""', 'cpf: getStr(init, "cpf", getStr(init, "doc"))'
$src = $src -replace 'rg:\s*init\.rg\s*\?\?\s*""', 'rg: getStr(init, "rg")'
$src = $src -replace 'cellphone:\s*init\.cellphone\s*\?\?\s*init\.phone\s*\?\?\s*""', 'cellphone: getStr(init, "cellphone", getStr(init, "phone"))'
$src = $src -replace 'email:\s*init\.email\s*\?\?\s*""', 'email: getStr(init, "email")'
$src = $src -replace 'cep:\s*init\.cep\s*\?\?\s*""', 'cep: getStr(init, "cep")'
$src = $src -replace 'logradouro:\s*init\.logradouro\s*\?\?\s*""', 'logradouro: getStr(init, "logradouro")'
$src = $src -replace 'numero:\s*init\.numero\s*\?\?\s*""', 'numero: getStr(init, "numero")'
$src = $src -replace 'complemento:\s*init\.complemento\s*\?\?\s*""', 'complemento: getStr(init, "complemento")'
$src = $src -replace 'bairro:\s*init\.bairro\s*\?\?\s*""', 'bairro: getStr(init, "bairro")'
$src = $src -replace 'cidade:\s*init\.cidade\s*\?\?\s*""', 'cidade: getStr(init, "cidade")'
$src = $src -replace 'uf:\s*\(\(init\.uf\s*\?\?\s*""\)\.toUpperCase\(\)\)', 'uf: getStr(init, "uf").toUpperCase()'

$src = $src -replace 'razaoSocial:\s*init\.razaoSocial\s*\?\?\s*init\.name\s*\?\?\s*""', 'razaoSocial: getStr(init, "razaoSocial", getStr(init, "name"))'
$src = $src -replace 'nomeFantasia:\s*init\.nomeFantasia\s*\?\?\s*""', 'nomeFantasia: getStr(init, "nomeFantasia")'
$src = $src -replace 'cnpj:\s*init\.cnpj\s*\?\?\s*init\.doc\s*\?\?\s*""', 'cnpj: getStr(init, "cnpj", getStr(init, "doc"))'
$src = $src -replace 'ie:\s*init\.ie\s*\?\?\s*""', 'ie: getStr(init, "ie")'

# Remove casts "as any" simples em register/setValue onde não precisa
$src = $src -replace '\s+as any', ""

Write-Utf8NoBom $file $src
Write-Host "✅ Patch aplicado: $file" -ForegroundColor Green
Write-Host "➡️ Rode: corepack pnpm -w lint" -ForegroundColor Cyan
