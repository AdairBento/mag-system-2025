# scripts/fix-lint-scripts.ps1
$ErrorActionPreference = "Stop"

function Ok([string]$m) { Write-Host "✅ $m" -ForegroundColor Green }
function Step([string]$m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Fail([string]$m) { Write-Host "❌ $m" -ForegroundColor Red; throw $m }

$repo = (Get-Location).Path
if (-not (Test-Path (Join-Path $repo "pnpm-workspace.yaml"))) {
  Fail "Rode na raiz do monorepo (pnpm-workspace.yaml). Atual: $repo"
}

function Set-ScriptProp($scriptsObj, [string]$name, [string]$value) {
  # Atualiza se existir
  if ($scriptsObj.PSObject.Properties.Name -contains $name) {
    $scriptsObj.PSObject.Properties[$name].Value = $value
    return
  }
  # Cria se não existir (funciona com 'lint:fix')
  $scriptsObj | Add-Member -MemberType NoteProperty -Name $name -Value $value -Force
}

$targets = @(
  @{ path = "packages/database/package.json"; lint = "eslint src" },
  @{ path = "packages/shared/package.json";   lint = "eslint src" },
  @{ path = "apps/api/package.json";          lint = "eslint src --ext .ts,.tsx,.js,.jsx" },
  @{ path = "apps/web/package.json";          lint = "eslint ." }
)

Step "1) Corrigir scripts lint e criar lint:fix (sem '--' '--fix' no script)"
foreach ($t in $targets) {
  $p = Join-Path $repo $t.path
  if (-not (Test-Path $p)) { Fail "Não encontrado: $p" }

  $raw = Get-Content -Raw -Encoding UTF8 $p
  $json = $raw | ConvertFrom-Json

  if (-not $json.scripts) {
    $json | Add-Member -MemberType NoteProperty -Name scripts -Value (New-Object PSCustomObject) -Force
  }

  Set-ScriptProp $json.scripts "lint" $t.lint
  Set-ScriptProp $json.scripts "lint:fix" ("{0} --fix" -f $t.lint)

  $out = $json | ConvertTo-Json -Depth 80
  [System.IO.File]::WriteAllText($p, $out + "`n", (New-Object System.Text.UTF8Encoding($false)))

  Ok "Atualizado: $($t.path)"
  Ok ("  lint     = {0}" -f $t.lint)
  Ok ("  lint:fix = {0} --fix" -f $t.lint)
}

Step "2) Rodar lint:fix por pacote (pra confirmar que não aparece '--' '--fix' como arquivo)"
& corepack pnpm -C packages/database run lint:fix
& corepack pnpm -C packages/shared run lint:fix
& corepack pnpm -C apps/api run lint:fix
& corepack pnpm -C apps/web run lint:fix

Ok "Tudo certo: scripts corrigidos e lint:fix rodou."
