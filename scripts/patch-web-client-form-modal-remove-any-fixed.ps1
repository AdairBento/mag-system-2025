#!/usr/bin/env pwsh
#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

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

# Insere helpers tipados (CORRETO: AnyRecord, não vRecord)
if ($src -notmatch "type AnyRecord") {
  $helpers = @'

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

'@
  $src = $src -replace '(import type \{ Client \} from "@/types/client";)', ('$1' + $helpers)
}

# Adiciona const init nos useEffect e usa helpers
$src = $src -replace 'React\.useEffect\(\(\) => \{', @'
React.useEffect(() => {
    const init = asRecord(initial);
'@

# Substitui acessos diretos por helpers
$src = $src -replace 'status:\s*"ATIVO"', 'status: getStatus(init)'
$src = $src -replace 'name:\s*""', 'name: getStr(init, "name")'
$src = $src -replace 'cpf:\s*""', 'cpf: getStr(init, "cpf")'
$src = $src -replace 'rg:\s*""', 'rg: getStr(init, "rg")'
$src = $src -replace 'cellphone:\s*""', 'cellphone: getStr(init, "cellphone")'
$src = $src -replace 'email:\s*""', 'email: getStr(init, "email")'
$src = $src -replace 'cep:\s*""', 'cep: getStr(init, "cep")'
$src = $src -replace 'logradouro:\s*""', 'logradouro: getStr(init, "logradouro")'
$src = $src -replace 'numero:\s*""', 'numero: getStr(init, "numero")'
$src = $src -replace 'complemento:\s*""', 'complemento: getStr(init, "complemento")'
$src = $src -replace 'bairro:\s*""', 'bairro: getStr(init, "bairro")'
$src = $src -replace 'cidade:\s*""', 'cidade: getStr(init, "cidade")'
$src = $src -replace 'uf:\s*""', 'uf: getStr(init, "uf")'
$src = $src -replace 'razaoSocial:\s*""', 'razaoSocial: getStr(init, "razaoSocial")'
$src = $src -replace 'nomeFantasia:\s*""', 'nomeFantasia: getStr(init, "nomeFantasia")'
$src = $src -replace 'cnpj:\s*""', 'cnpj: getStr(init, "cnpj")'
$src = $src -replace 'ie:\s*""', 'ie: getStr(init, "ie")'

Write-Utf8NoBom $file $src
Write-Host "✅ Patch aplicado: $file" -ForegroundColor Green
