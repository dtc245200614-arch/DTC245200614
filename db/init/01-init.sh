#!/bin/bash
# Runs once on first DB start. Creates schema + least-privilege roles.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v app_pw="$APP_DB_PASSWORD" -v exp_pw="$EXPORTER_DB_PASSWORD" -v appuser="$APP_DB_USER" <<'EOSQL'
CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income','expense'))
);
CREATE TABLE transactions (
  id          SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id),
  amount      NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  note        VARCHAR(200),
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX idx_tx_date ON transactions(occurred_on);

INSERT INTO categories(name,type) VALUES
 ('Lương','income'),('Thưởng','income'),('Ăn uống','expense'),
 ('Đi lại','expense'),('Nhà ở','expense'),('Giải trí','expense');
INSERT INTO transactions(category_id,amount,note,occurred_on) VALUES
 (1,15000000,'Lương tháng',CURRENT_DATE - 20),
 (3,250000,'Ăn trưa',CURRENT_DATE - 5),
 (4,120000,'Xăng xe',CURRENT_DATE - 4),
 (5,3500000,'Tiền thuê nhà',CURRENT_DATE - 3),
 (6,300000,'Xem phim',CURRENT_DATE - 1);

-- Application role: DML only on its own tables, no DDL, no superuser
CREATE ROLE :"appuser" LOGIN PASSWORD :'app_pw' NOSUPERUSER NOCREATEDB NOCREATEROLE;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO :"appuser";
GRANT SELECT, INSERT, UPDATE, DELETE ON categories, transactions TO :"appuser";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"appuser";

-- Monitoring role: read-only statistics
CREATE ROLE exporter LOGIN PASSWORD :'exp_pw' NOSUPERUSER;
GRANT pg_monitor TO exporter;
EOSQL
