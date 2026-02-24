$ErrorActionPreference = "Stop"

Write-Host '========== Deploy ClassHub =========='
Write-Host ''

function RunStep {
    param(
        [string]$Title,
        [scriptblock]$Action
    )

    Write-Host ("[STEP] {0}..." -f $Title)
    & $Action
    Write-Host ("[OK]   {0}" -f $Title)
    Write-Host ''
}

try {
    # Backend - testes
    Push-Location 'professor-quarkus'
    RunStep 'Rodando testes do backend (Quarkus)' {
        .\mvnw test
    }

    # Backend - build produção
    RunStep 'Build de produção do backend' {
        .\mvnw package -DskipTests
    }
    Pop-Location

    # Frontend - testes
    Push-Location 'professor-front'
    RunStep 'Rodando testes do frontend (Angular)' {
        npm test -- --watch=false
    }
    Pop-Location

    # Frontend - build produção
    Push-Location 'professor-front'
    RunStep 'Build de produção do frontend' {
        npm run build
    }
    Pop-Location

    Write-Host '========== TESTES E BUILDS OK =========='
    Write-Host ''
    Write-Host 'Artefatos gerados localmente (build completo OK):'
    Write-Host ' - Frontend:  professor-front/dist/'
    Write-Host ' - Backend:   professor-quarkus\target\'
}
catch {
    Write-Host ''
    Write-Host '======== ERRO NO DEPLOY ========'
    Write-Host $_.Exception.Message
    exit 1
}

