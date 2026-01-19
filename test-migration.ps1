# TESTE COMPLETO DE MIGRAÇÃO DE MOTORISTA

Write-Host "`n🧪 TESTANDO FLUXO COMPLETO`n" -ForegroundColor Green

# 1. Empresa A
$empresaA = @{
    type = "PJ"
    name = "Transportadora Alpha"
    cnpj = "11111111000100"
    email = "alpha@email.com"
    phone = "3199999999"
    ie = "123456789"
    responsibleName = "João"
    responsiblePhone = "31988888888"
    cep = "30130100"
    logradouro = "Rua A"
    numero = "100"
    bairro = "Centro"
    cidade = "BH"
    uf = "MG"
    status = "ATIVO"
} | ConvertTo-Json

$resA = Invoke-RestMethod -Uri "http://localhost:3001/clients" -Method POST -Body $empresaA -ContentType "application/json"
Write-Host "✅ Empresa A: $($resA.id)" -ForegroundColor Green

# 2. Empresa B
$empresaB = @{
    type = "PJ"
    name = "Logística Beta"
    cnpj = "22222222000199"
    email = "beta@email.com"
    phone = "3188888888"
    ie = "987654321"
    responsibleName = "Maria"
    responsiblePhone = "31977777777"
    cep = "30140071"
    logradouro = "Rua B"
    numero = "200"
    bairro = "Centro"
    cidade = "BH"
    uf = "MG"
    status = "ATIVO"
} | ConvertTo-Json

$resB = Invoke-RestMethod -Uri "http://localhost:3001/clients" -Method POST -Body $empresaB -ContentType "application/json"
Write-Host "✅ Empresa B: $($resB.id)" -ForegroundColor Green

# 3. Motorista
$driver = @{
    name = "Carlos Moto"
    cpf = "11122233344"
    licenseNumber = "CNH987654"
    licenseCategory = "D"
    licenseExpiry = "2028-12-31"
    email = "carlos@email.com"
    cellphone = "31985555555"
    status = "ATIVO"
    clientId = $resA.id
} | ConvertTo-Json

$driverCriado = Invoke-RestMethod -Uri "http://localhost:3001/drivers" -Method POST -Body $driver -ContentType "application/json"
Write-Host "✅ Motorista criado: $($driverCriado.id)" -ForegroundColor Green

# 4. Tentar duplicar
$duplicado = @{
    name = $driverCriado.name
    cpf = $driverCriado.cpf
    licenseNumber = $driverCriado.licenseNumber
    licenseCategory = $driverCriado.licenseCategory
    licenseExpiry = $driverCriado.licenseExpiry
    email = $driverCriado.email
    cellphone = $driverCriado.cellphone
    status = "ATIVO"
    clientId = $resB.id
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3001/drivers" -Method POST -Body $duplicado -ContentType "application/json" | Out-Null
} catch {
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✅ Conflito detectado: $($errorBody.message)" -ForegroundColor Green
    
    # 5. Migrar
    $migrateBody = @{ newClientId = $resB.id } | ConvertTo-Json
    $migrated = Invoke-RestMethod -Uri "http://localhost:3001/drivers/$($driverCriado.id)/migrate" -Method POST -Body $migrateBody -ContentType "application/json"
    Write-Host "✅ Migrado para: $($migrated.clientId)" -ForegroundColor Green
}

Write-Host "`n✅ TESTE COMPLETO PASSOU!`n" -ForegroundColor Green
