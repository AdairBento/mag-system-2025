Write-Host '🔒 Verificando secrets...' -ForegroundColor Yellow
gitleaks detect --source . --verbose --exit-code 1
if ($LASTEXITCODE -eq 0) {
    Write-Host '✅ Nenhum secret encontrado!' -ForegroundColor Green
} else {
    Write-Host '❌ SECRETS ENCONTRADOS! Corrija antes de commitar!' -ForegroundColor Red
    exit 1
}
