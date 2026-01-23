# ============================================================
# 🔍 ANÁLISE DOS 2 ERROS RESTANTES
# ============================================================

Write-Host "`n🔍 ANÁLISE DOS 2 ERROS RESTANTES`n" -ForegroundColor Cyan

# Executar typecheck e capturar apenas linhas de erro
Write-Host "Executando typecheck..." -ForegroundColor Yellow
$output = pnpm typecheck 2>&1 | Out-String

# Filtrar apenas linhas com "error TS"
$errorLines = $output -split "`n" | Where-Object { $_ -match "error TS\d+" }

Write-Host "`n📋 Erros encontrados ($($errorLines.Count)):`n" -ForegroundColor Yellow

foreach ($line in $errorLines) {
    # Extrair arquivo e número da linha
    if ($line -match "^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$") {
        $file = $matches[1]
        $lineNum = $matches[2]
        $col = $matches[3]
        $errorCode = $matches[4]
        $message = $matches[5]
        
        Write-Host "📁 Arquivo: $file" -ForegroundColor White
        Write-Host "   Linha: $lineNum, Coluna: $col" -ForegroundColor Gray
        Write-Host "   Erro: $errorCode - $message" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host ("=" * 70) -ForegroundColor DarkGray
Write-Host "💡 Aguardando output completo para correção..." -ForegroundColor Cyan
