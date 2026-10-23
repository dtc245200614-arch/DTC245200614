#!/bin/sh
# Generates .env with strong random passwords (skips if it exists)
cd "$(dirname "$0")/.." || exit 1
[ -f .env ] && { echo ".env already exists"; exit 0; }
pw() { head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24; }
cat > .env <<EOF
POSTGRES_DB=expense
POSTGRES_USER=expense_admin
POSTGRES_PASSWORD=$(pw)
APP_DB_USER=expense_app
APP_DB_PASSWORD=$(pw)
EXPORTER_DB_PASSWORD=$(pw)
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=$(pw)
GRAFANA_USER=admin
GRAFANA_PASSWORD=$(pw)
EOF
echo "Created .env"
