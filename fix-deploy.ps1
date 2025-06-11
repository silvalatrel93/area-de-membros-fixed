#!/usr/bin/env pwsh

# Script para corrigir deploy do Área de Membros
Write-Host "=== Correção Deploy Área de Membros ===" -ForegroundColor Green

# Verificar se git está configurado
Write-Host "1. Verificando status Git..." -ForegroundColor Yellow
git status

Write-Host "`n2. Remover remote antigo..." -ForegroundColor Yellow
git remote remove origin

Write-Host "`n3. Aguardando nova URL do repositório..." -ForegroundColor Yellow
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://github.com/new" -ForegroundColor White
Write-Host "2. Nome: area-de-membros-fixed" -ForegroundColor White
Write-Host "3. NÃO inicialize com README" -ForegroundColor White
Write-Host "4. Copie a URL do repositório" -ForegroundColor White
Write-Host "5. Execute: git remote add origin [URL_COPIADA]" -ForegroundColor White
Write-Host "6. Execute: git push -u origin main" -ForegroundColor White

Write-Host "`n4. Verificando arquivo vite.config.ts..." -ForegroundColor Yellow
$viteConfig = Get-Content "vite.config.ts" -Raw
if ($viteConfig -match 'outDir: "dist"') {
    Write-Host "✅ vite.config.ts está correto!" -ForegroundColor Green
} else {
    Write-Host "❌ vite.config.ts precisa ser corrigido!" -ForegroundColor Red
}

Write-Host "`n5. Verificando estrutura do projeto..." -ForegroundColor Yellow
$directories = @("client", "server", "netlify", "shared")
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir/" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir/ não encontrado!" -ForegroundColor Red
    }
}

Write-Host "`n=== RESUMO ===" -ForegroundColor Green
Write-Host "Após criar o repositório GitHub:" -ForegroundColor White
Write-Host "1. git remote add origin [URL]" -ForegroundColor White
Write-Host "2. git push -u origin main" -ForegroundColor White
Write-Host "3. Conectar Netlify ao novo repositório" -ForegroundColor White
Write-Host "4. Deploy automático será executado" -ForegroundColor White 