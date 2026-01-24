# scripts/fix-clientes-bugs.ps1
# Aplica correções automáticas nos bugs do módulo de clientes (CNH AB default / reset modal / phone field).
# Uso:
#   pwsh -ExecutionPolicy Bypass -File .\scripts\fix-clientes-bugs.ps1
#   pwsh -ExecutionPolicy Bypass -File .\scripts\fix-clientes-bugs.ps1 -DryRun

param(
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = (Get-Location).Path

function Ensure-File($p) {
  if (-not (Test-Path $p)) { throw "Arquivo não encontrado: $p" }
}

function Backup-File($p) {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $bak = "$p.bak.$ts"
  Copy-Item -LiteralPath $p -Destination $bak -Force
  return $bak
}

function Read-Text($p) {
  return Get-Content -LiteralPath $p -Raw -ErrorAction Stop
}

function Write-Text($p, $txt) {
  if ($DryRun) { return }
  Set-Content -LiteralPath $p -Value $txt -Encoding UTF8
}

function Replace-All([string]$txt, [string]$pattern, [string]$replacement, [ref]$count) {
  $rx = [regex]::new($pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
  $m = $rx.Matches($txt)
  $count.Value += $m.Count
  return $rx.Replace($txt, $replacement)
}

function Info($m) { Write-Host $m -ForegroundColor Cyan }
function Good($m) { Write-Host $m -ForegroundColor Green }
function Warn($m) { Write-Host $m -ForegroundColor Yellow }
function Bad($m)  { Write-Host $m -ForegroundColor Red }

Info "🔧 FIX AUTOMÁTICO - Clientes (MAG)"
Info ("📁 Repo: {0}" -f $root)
if ($DryRun) { Warn "⚠️ DRY-RUN ligado: não vai gravar nada." }
""

# --- Arquivos alvo (do seu audit) ---
$clientModal = Join-Path $root "apps\web\src\app\(app)\clientes\_components\client-form-modal.tsx"
$driverModal = Join-Path $root "apps\web\src\app\(app)\clientes\_components\driver-form-modal.tsx"
$clientTable = Join-Path $root "apps\web\src\app\(app)\clientes\_components\client-table.tsx"

Ensure-File $clientModal
Ensure-File $driverModal
Ensure-File $clientTable

# --- 1) Corrigir CNH AB default (driver-form-modal) ---
Info "1) Corrigindo CNH 'AB' default no driver-form-modal..."
$bak1 = Backup-File $driverModal

$txt = Read-Text $driverModal
$changed = 0

# Troca return "AB"; // default MAG (...)  -> return "";
$txt2 = Replace-All $txt 'return\s+["'']AB["'']\s*;\s*//\s*default\s*MAG[^\r\n]*' 'return ""; // default removido (não inferir AB automaticamente)' ([ref]$changed)

# Se ainda existir algum "return 'AB';" solto como fallback, troca por return "" APENAS se estiver comentado como default
$txt2 = Replace-All $txt2 'return\s+["'']AB["'']\s*;\s*//\s*default[^\r\n]*' 'return ""; // default removido (não inferir AB automaticamente)' ([ref]$changed)

if ($changed -gt 0) {
  Write-Text $driverModal $txt2
  Good ("✅ driver-form-modal.tsx: {0} ajuste(s) aplicado(s). Backup: {1}" -f $changed, $bak1)
} else {
  Warn "⚠️ Nenhum padrão 'default AB' encontrado para trocar (arquivo pode já estar ok)."
}

""

# --- 2) Corrigir tabela usando phone (client-table) ---
Info "2) Padronizando telefone na tabela (remover c.phone)..."
$bak2 = Backup-File $clientTable

$txt = Read-Text $clientTable
$changed = 0

# c.cellphone ?? c.phone ?? "-"  -> c.cellphone ?? c.telephone ?? "-"
$txt2 = Replace-All $txt 'c\.cellphone\s*\?\?\s*c\.phone\s*\?\?\s*["'']-["'']' 'c.cellphone ?? c.telephone ?? "-"' ([ref]$changed)

if ($changed -gt 0) {
  Write-Text $clientTable $txt2
  Good ("✅ client-table.tsx: {0} ajuste(s) aplicado(s). Backup: {1}" -f $changed, $bak2)
} else {
  Warn "⚠️ Não achei o trecho c.cellphone ?? c.phone ?? '-' (pode estar diferente)."
}

""

# --- 3) Corrigir reset do modal (client-form-modal) ---
# Estratégia automática e segura:
# - Injeta um useEffect correto (se ainda não existir) usando um marcador
# - Comenta as linhas problemáticas setForm(emptyForm) e setClientType("PF") quando elas aparecem juntas
Info "3) Corrigindo reset indevido no client-form-modal..."
$bak3 = Backup-File $clientModal

$txt = Read-Text $clientModal
$changedInject = 0
$changedComment = 0

# 3.1 Comentar o reset problemático (as 2 linhas juntas, em qualquer bloco)
$txt2 = $txt

# comenta setForm(emptyForm); (somente quando não estiver já comentado)
$txt2 = Replace-All $txt2 '(?m)^(?<indent>\s*)setForm\(\s*emptyForm\s*\)\s*;\s*$' '${indent}// setForm(emptyForm); // DESATIVADO: reset ao abrir apagava dados' ([ref]$changedComment)

# comenta setClientType("PF"); (somente quando não estiver já comentado)
$txt2 = Replace-All $txt2 '(?m)^(?<indent>\s*)setClientType\(\s*["'']PF["'']\s*\)\s*;\s*$' '${indent}// setClientType("PF"); // DESATIVADO: não forçar PF ao abrir' ([ref]$changedComment)

# 3.2 Injetar um useEffect correto se não existir nosso marcador
if ($txt2 -notmatch 'MAG_FIX_MODAL_INIT_V1') {
  $inject = @'
  // MAG_FIX_MODAL_INIT_V1
  // ✅ Correção: reset somente ao FECHAR e carregar initialData 1x por ID na edição.
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    // quando fecha: limpa
    if (!isOpen) {
      loadedIdRef.current = null;
      setForm(emptyForm);
      setClientType("PF");
      return;
    }

    // quando abre para editar: carrega 1x por ID
    if (initialData?.id) {
      if (loadedIdRef.current === initialData.id) return;
      loadedIdRef.current = initialData.id;

      setClientType(initialData.type ?? "PF");
      setForm((prev) => ({
        ...prev,
        name: initialData.name ?? "",
        cpf: initialData.cpf ?? "",
        cnpj: initialData.cnpj ?? "",
        email: initialData.email ?? "",
        telephone: initialData.telephone ?? "",
        cellphone: initialData.cellphone ?? "",

        licenseNumber: initialData.licenseNumber ?? "",
        licenseCategory: initialData.licenseCategory ?? "",
        licenseExpiry: initialData.licenseExpiry ?? null,

        zipCode: initialData.zipCode ?? "",
        street: initialData.street ?? "",
        number: initialData.number ?? "",
        complement: initialData.complement ?? "",
        neighborhood: initialData.neighborhood ?? "",
        city: initialData.city ?? "",
        state: initialData.state ?? "",

        companyName: initialData.companyName ?? "",
        tradeName: initialData.tradeName ?? "",
        stateRegistration: initialData.stateRegistration ?? "",

        observations: initialData.observations ?? "",
        status: initialData.status ?? "ATIVO",
        type: initialData.type ?? "PF",
      }));

      return;
    }

    // novo cliente: não faz reset aqui (já resetamos ao fechar)
    loadedIdRef.current = null;
  }, [isOpen, initialData, emptyForm]);
'@

  # Garantir imports necessários
  if ($txt2 -notmatch 'useRef') {
    # tenta adicionar useRef no import react
    $txt2 = Replace-All $txt2 '(?m)^import\s+\{\s*([^}]+)\s*\}\s+from\s+["'']react["''];\s*$' { 
      param($m)
      $inside = $m.Groups[1].Value
      if ($inside -match '\buseRef\b') { return $m.Value }
      return "import { $inside, useRef } from `"react`";"
    } ([ref]$changedInject)
  }

  # injeta após a definição do emptyForm (heurística: depois da primeira ocorrência de "emptyForm")
  if ($txt2 -match 'emptyForm') {
    $txt2 = [regex]::Replace(
      $txt2,
      '(?s)(const\s+emptyForm[\s\S]{0,2000}?;\s*\r?\n)',
      "`$1`r`n$inject`r`n",
      1
    )
    $changedInject++
  } else {
    Warn "⚠️ Não consegui localizar 'emptyForm' para injetar o useEffect automaticamente."
  }
}

if (($changedComment + $changedInject) -gt 0) {
  Write-Text $clientModal $txt2
  Good ("✅ client-form-modal.tsx: comments={0}, inject={1}. Backup: {2}" -f $changedComment, $changedInject, $bak3)
} else {
  Warn "⚠️ Nenhuma mudança aplicada no client-form-modal (pode já estar corrigido)."
}

""
Good "✅ Concluído."

if ($DryRun) {
  Warn "`n(DRY-RUN) Nada foi gravado. Rode sem -DryRun para aplicar."
} else {
  Info "`nPróximo:"
  Info "1) rode: pnpm -w lint (ou pnpm lint) / pnpm -w test se tiver"
  Info "2) abra Clientes → Novo/Editar e valide que não limpa mais"
}
