# Expense Tracker – Docker Compose DevOps Stack

Hệ thống quản lý chi tiêu cá nhân/gia đình (giao dịch, danh mục, báo cáo) triển khai hoàn toàn bằng Docker Compose.

**Stack:** Node.js (Express) · PostgreSQL 16 · pgAdmin 4 · Nginx (HTTPS tự ký) · Prometheus · Grafana · cAdvisor · Loki · Promtail

```
 Browser ──HTTPS 443──► Nginx ──► app (Node.js) ──► PostgreSQL ◄── pgAdmin (127.0.0.1:5050)
                          │            │ /metrics         │
                          │ stub_status│                  │ pg_stat
                          ▼            ▼                  ▼
        nginx-exporter / app / cAdvisor / postgres-exporter ──► Prometheus ──► Grafana (127.0.0.1:3000)
        stdout logs of all containers ──► Promtail ──► Loki ──────────────────► Grafana (Explore / LogQL)
```

## Chạy hệ thống

Yêu cầu: Docker Desktop / Docker Engine + Compose v2.

```powershell
# 1. Sinh mật khẩu mạnh -> .env (không commit)
powershell -File scripts/init-env.ps1        # Linux/macOS: sh scripts/init-env.sh
# 2. Sinh chứng chỉ HTTPS tự ký -> nginx/certs
powershell -File scripts/gen-cert.ps1        # Linux/macOS: sh scripts/gen-cert.sh
# 3. Khởi động
docker compose up -d --build
docker compose ps
```

| Thành phần | URL | Đăng nhập |
|---|---|---|
| Website | https://localhost (HTTP :80 tự chuyển sang HTTPS) | – |
| pgAdmin | http://localhost:5050 | `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` trong `.env` |
| Grafana | http://localhost:3000 | `GRAFANA_USER` / `GRAFANA_PASSWORD` |
| Prometheus | http://localhost:9090 (Status → Targets) | – |

Kết nối DB trong pgAdmin: *Register → Server*, host `db`, port `5432`, DB `expense`, user `POSTGRES_USER`, mật khẩu `POSTGRES_PASSWORD`.

> Sau khi đổi mật khẩu trong `.env`, cần `docker compose down -v` để DB khởi tạo lại.

## Các commit theo yêu cầu

| Commit | Nội dung |
|---|---|
| 1 | Ứng dụng + PostgreSQL + pgAdmin + Nginx reverse proxy (HTTPS tự ký, security headers) |
| 2 | Prometheus + Grafana + cAdvisor + nginx-exporter + postgres-exporter + dashboard |
| 3 | Loki + Promtail, log JSON, truy vấn LogQL |
| 4 | README, tài liệu hardening, báo cáo |

## Truy vấn LogQL (Grafana → Explore → Loki)

```logql
# 1. Toàn bộ log của ứng dụng Node.js
{service="app"}

# 2. Request lỗi (status >= 400) trên Nginx, parse JSON
{service="nginx"} | json | status >= 400

# 3. Tốc độ request/phút theo service
sum by (service) (rate({compose_project="expense-tracker"}[1m]))

# 4. Lỗi xử lý trong app
{service="app"} | json | level="error"

# 5. Request chậm (> 0.5s) qua Nginx
{service="nginx"} | json | request_time > 0.5
```

## Hardening

| Biện pháp | Áp dụng |
|---|---|
| Non-root container | app (`USER node`), nginx (`nginx-unprivileged`, uid 101), Prometheus (nobody), Grafana (472), Loki (10001), pgAdmin (5050), PostgreSQL (hạ quyền xuống `postgres`) |
| Network isolation | `backend` & `monitoring` là mạng `internal` (không ra Internet); DB không publish port; chỉ Nginx publish 80/443 |
| Mật khẩu mạnh | `.env` sinh ngẫu nhiên 24 ký tự, nằm trong `.gitignore` |
| Hạn chế quyền | `no-new-privileges`, `cap_drop: ALL`, `read_only` filesystem (app, nginx, exporters), socket Docker mount `:ro` |
| Least privilege DB | role `expense_app` chỉ DML trên 2 bảng; role `exporter` chỉ `pg_monitor`; `REVOKE ALL ON SCHEMA public FROM PUBLIC` |
| Nginx | HTTPS TLS1.2/1.3, HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, `server_tokens off`, rate limiting, chặn `/metrics` |
| Cổng quản trị | pgAdmin/Grafana/Prometheus chỉ bind `127.0.0.1` |
| Ứng dụng | Truy vấn tham số hóa (chống SQL injection), validate input, giới hạn body 10 KB, frontend không dùng `innerHTML` (chống XSS) |

Ngoại lệ có chủ đích: `cAdvisor` cần `privileged` và `Promtail` chạy root để đọc docker socket (chỉ đọc) – đã ghi trong báo cáo như rủi ro còn lại.

## Cấu trúc repo

```
app/            Node.js app + Dockerfile + frontend (public/)
db/init/        Schema, seed data, role least-privilege
nginx/          default.conf (reverse proxy, TLS, headers), certs/ (tự sinh)
prometheus/     prometheus.yml
grafana/        provisioning (datasources, dashboard provider) + dashboards/overview.json
loki/ promtail/ Cấu hình log tập trung
scripts/        Sinh .env và chứng chỉ
report/         Báo cáo (sinh bằng make-report.js)
```
