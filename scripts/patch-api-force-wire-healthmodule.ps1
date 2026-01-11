$ErrorActionPreference = "Stop"

$root = (Resolve-Path ".").Path
$appModule = Join-Path $root "apps/api/src/app.module.ts"

if (-not (Test-Path $appModule)) { throw "Não encontrei $appModule" }

$orig = Get-Content -LiteralPath $appModule -Raw -Encoding UTF8
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item -LiteralPath $appModule -Destination "$appModule.bak.$stamp" -Force

$txt = $orig

# 1) ensure import exists
if ($txt -notmatch "import\s+\{\s*HealthModule\s*\}\s+from\s+['""]\.\/health\/health\.module['""];") {
  # insert after last import line
  $txt = [regex]::Replace(
    $txt,
    "(?m)^(import .+?;\s*)+",
    { param($m) $m.Value + "`nimport { HealthModule } from `"./health/health.module`";`n" },
    1
  )
}

# 2) ensure HealthModule in @Module imports array
$txt = [regex]::Replace(
  $txt,
  "(?s)(@Module\s*\(\s*\{\s*.*?imports\s*:\s*\[)(.*?)(\]\s*,)",
  {
    param($m)
    $before = $m.Groups[1].Value
    $inside = $m.Groups[2].Value
    $after  = $m.Groups[3].Value

    if ($inside -match "\bHealthModule\b") { return $m.Value }

    $insideTrim = $inside.Trim()
    if ([string]::IsNullOrWhiteSpace($insideTrim)) {
      return $before + "HealthModule" + $after
    }

    return $before + $insideTrim.TrimEnd() + ", HealthModule" + $after
  },
  1
)

Set-Content -LiteralPath $appModule -Value $txt -Encoding UTF8 -NoNewline
Write-Host "✅ HealthModule garantido no imports. Backup: $appModule.bak.$stamp"
Write-Host "➡️ Reinicie o apps/api dev e teste: curl http://localhost:3001/health"
