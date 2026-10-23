# Generates .env with strong random passwords (skips if it exists)
$envFile = Join-Path $PSScriptRoot '..\.env'
if (Test-Path $envFile) { Write-Host '.env already exists'; exit 0 }
function New-Pw { -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ }) }
@"
POSTGRES_DB=expense
POSTGRES_USER=expense_admin
POSTGRES_PASSWORD=$(New-Pw)
APP_DB_USER=expense_app
APP_DB_PASSWORD=$(New-Pw)
EXPORTER_DB_PASSWORD=$(New-Pw)
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=$(New-Pw)
GRAFANA_USER=admin
GRAFANA_PASSWORD=$(New-Pw)
"@ | Set-Content -Encoding ascii $envFile
Write-Host "Created $envFile"
