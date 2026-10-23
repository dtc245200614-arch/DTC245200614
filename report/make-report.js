// Sinh báo cáo: node make-report.js  ->  BaoCao_ExpenseTracker.docx
// Đặt ảnh chụp màn hình vào report/images/<tên>.png (tên xem trong fig(...)) rồi chạy lại để chèn ảnh thật.
const fs = require('fs');
const path = require('path');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, ImageRun, Table, TableRow, TableCell,
  WidthType, PageBreak, BorderStyle, Footer, PageNumber } = D;

// ====== THÔNG TIN SINH VIÊN – SỬA TẠI ĐÂY ======
const INFO = {
  school: 'TRƯỜNG ĐẠI HỌC ........................',
  faculty: 'KHOA CÔNG NGHỆ THÔNG TIN',
  student: 'Họ và tên: ........................',
  mssv: 'Mã số sinh viên: ........................',
  cls: 'Lớp: ........................',
  teacher: 'Giảng viên hướng dẫn: ........................',
  github: 'https://github.com/<MSSV>/expense-tracker',
  city: 'TP. Hồ Chí Minh',
  year: '2026',
};
// ================================================

const FONT = 'Times New Roman';
const t = (text, o = {}) => new TextRun({ text, font: FONT, size: 26, ...o });
const center = (text, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [t(text, o)] });
const h1 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { after: 240 }, children: [t(s, { bold: true, size: 32 })] });
const h2 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 }, children: [t(s, { bold: true, size: 28 })] });
const p = (s) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 360 }, indent: { firstLine: 567 }, children: [t(s)] });
const li = (s) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60, line: 340 }, children: [t(s)] });
const code = (s) => s.split('\n').map((l) => new Paragraph({ spacing: { after: 0 }, shading: { fill: 'F2F2F2' },
  children: [new TextRun({ text: l || ' ', font: 'Consolas', size: 20 })] }));
const noBorder = { style: BorderStyle.SINGLE, size: 4, color: '999999' };

function fig(name, caption, hint) {
  const file = path.join(__dirname, 'images', name + '.png');
  let inner;
  if (fs.existsSync(file)) {
    inner = new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: fs.readFileSync(file), transformation: { width: 560, height: 315 }, type: 'png' })] });
  } else {
    inner = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 1200 },
      children: [t(`[CHÈN ẢNH: ${name}.png – ${hint}]`, { italics: true, color: '808080' })] });
  }
  return [
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [new TableCell({
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [inner] })] })] }),
    center(caption, { italics: true, size: 24 }),
  ];
}
function table(rows, widths) {
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows.map((r, i) => new TableRow({
    children: r.map((c) => new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
      shading: i === 0 ? { fill: 'D9E2F3' } : undefined,
      children: [new Paragraph({ children: [t(c, { size: 22, bold: i === 0 })] })] })) })) });
}

const c = [];
// ---------- BÌA ----------
c.push(center('BỘ GIÁO DỤC VÀ ĐÀO TẠO', { bold: true }), center(INFO.school, { bold: true }), center(INFO.faculty, { bold: true }),
  center('—————————'), center(''), center(''), center('BÁO CÁO THỰC TẬP', { bold: true, size: 40 }), center(''),
  center('ĐỀ TÀI:', { bold: true, size: 30 }),
  center('TRIỂN KHAI HỆ THỐNG QUẢN LÝ CHI TIÊU (EXPENSE TRACKER)', { bold: true, size: 32 }),
  center('BẰNG DOCKER COMPOSE: NGINX, POSTGRESQL + PGADMIN, PROMETHEUS + GRAFANA, LOKI + PROMTAIL VÀ HARDENING', { bold: true, size: 28 }),
  center(''), center(''), center(''),
  new Paragraph({ indent: { left: 2800 }, spacing: { after: 100 }, children: [t(INFO.student)] }),
  new Paragraph({ indent: { left: 2800 }, spacing: { after: 100 }, children: [t(INFO.mssv)] }),
  new Paragraph({ indent: { left: 2800 }, spacing: { after: 100 }, children: [t(INFO.cls)] }),
  new Paragraph({ indent: { left: 2800 }, spacing: { after: 100 }, children: [t(INFO.teacher)] }),
  new Paragraph({ indent: { left: 2800 }, spacing: { after: 100 }, children: [t('GitHub: ' + INFO.github)] }),
  center(''), center(''), center(`${INFO.city}, ${INFO.year}`, { italics: true }));

// ---------- MỤC LỤC ----------
c.push(h1('MỤC LỤC'));
['Chương 1. Giới thiệu đề tài', 'Chương 2. Kiến trúc hệ thống', 'Chương 3. Triển khai ứng dụng, cơ sở dữ liệu và công cụ quản lý (pgAdmin)',
  'Chương 4. Nginx Reverse Proxy và HTTPS (Commit 1)', 'Chương 5. Giám sát với Prometheus và Grafana (Commit 2)',
  'Chương 6. Log tập trung với Loki, Promtail và LogQL (Commit 3)', 'Chương 7. Hardening hệ thống',
  'Chương 8. Quản lý mã nguồn GitHub và hướng dẫn chạy', 'Chương 9. Kết luận và hướng phát triển'].forEach((s) => c.push(p(s)));

// ---------- CH1 ----------
c.push(h1('CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI'),
  h2('1.1. Bối cảnh và mục tiêu'),
  p('Quản lý chi tiêu cá nhân và gia đình là nhu cầu phổ biến. Một ứng dụng web ghi nhận các giao dịch thu – chi, phân loại theo danh mục và tổng hợp báo cáo giúp người dùng kiểm soát tài chính tốt hơn. Bên cạnh việc xây dựng ứng dụng, đề tài tập trung vào khía cạnh vận hành (DevOps): đóng gói, triển khai, giám sát, thu thập log tập trung và bảo mật hệ thống.'),
  p('Mục tiêu của đề tài là triển khai toàn bộ hệ thống bằng Docker Compose, trong đó mọi dịch vụ chạy dưới dạng container có thể tái lập chỉ với một lệnh. Hệ thống cần đáp ứng các yêu cầu: (1) quản lý mã nguồn và cấu hình trên GitHub; (2) triển khai ứng dụng web cùng PostgreSQL và pgAdmin; (3) cấu hình Nginx làm reverse proxy với HTTPS tự ký và security headers; (4) giám sát bằng Prometheus và Grafana; (5) log tập trung bằng Loki và Promtail, truy vấn bằng LogQL; (6) áp dụng các biện pháp hardening.'),
  h2('1.2. Công nghệ sử dụng'),
  table([['Thành phần', 'Công nghệ', 'Vai trò'],
    ['Ứng dụng', 'Node.js 20 + Express', 'API giao dịch, danh mục, báo cáo; phục vụ giao diện web'],
    ['Cơ sở dữ liệu', 'PostgreSQL 16', 'Lưu trữ dữ liệu quan hệ'],
    ['Quản lý DB', 'pgAdmin 4', 'Giao diện quản trị PostgreSQL'],
    ['Reverse proxy', 'Nginx (unprivileged)', 'HTTPS, security headers, rate limit'],
    ['Giám sát', 'Prometheus, Grafana, cAdvisor, exporters', 'Thu thập và trực quan hóa metrics'],
    ['Log', 'Loki, Promtail', 'Thu thập, lưu trữ, truy vấn log bằng LogQL'],
    ['Điều phối', 'Docker Compose v2', 'Triển khai toàn bộ stack']]),
  h2('1.3. Chức năng của ứng dụng'),
  li('Quản lý danh mục thu nhập/chi tiêu (thêm, xóa, chặn xóa khi danh mục đang được sử dụng).'),
  li('Ghi nhận giao dịch với số tiền, ghi chú, ngày phát sinh; xóa giao dịch.'),
  li('Báo cáo: tổng thu, tổng chi, số dư; thống kê theo danh mục; thống kê theo tháng.'),
  li('Cung cấp endpoint /healthz và /metrics phục vụ giám sát.'));

// ---------- CH2 ----------
c.push(h1('CHƯƠNG 2. KIẾN TRÚC HỆ THỐNG'),
  h2('2.1. Sơ đồ tổng thể'),
  p('Hệ thống gồm 11 container được chia thành ba mạng Docker. Người dùng chỉ truy cập qua Nginx (cổng 80/443). Ứng dụng Node.js giao tiếp với PostgreSQL qua mạng backend. Các thành phần giám sát nằm trong mạng monitoring và thu thập số liệu từ ứng dụng, Nginx, PostgreSQL và Docker.'),
  ...fig('architecture', 'Hình 2.1. Sơ đồ kiến trúc hệ thống', 'vẽ sơ đồ kiến trúc (draw.io) hoặc dùng sơ đồ ASCII trong README'),
  h2('2.2. Phân tách mạng (network isolation)'),
  table([['Mạng', 'Kiểu', 'Container', 'Mục đích'],
    ['frontend', 'bridge', 'nginx, app, pgadmin, grafana, prometheus', 'Các dịch vụ cần được truy cập từ máy chủ'],
    ['backend', 'internal', 'db, app, pgadmin, postgres-exporter', 'Đường đi tới cơ sở dữ liệu, không ra Internet'],
    ['monitoring', 'internal', 'prometheus, grafana, loki, promtail, cadvisor, exporters, app, nginx', 'Mặt phẳng giám sát và log']]),
  p('Cơ sở dữ liệu không publish cổng ra máy chủ và chỉ nằm trong mạng backend dạng internal, do đó không thể truy cập từ bên ngoài. pgAdmin, Grafana và Prometheus chỉ được bind vào 127.0.0.1 nên chỉ người quản trị tại máy chủ mới truy cập được.'),
  h2('2.3. Luồng hoạt động'),
  li('Trình duyệt gửi yêu cầu HTTPS tới Nginx; Nginx áp dụng security headers, giới hạn tốc độ rồi proxy tới app:3000.'),
  li('App thực hiện truy vấn tham số hóa tới PostgreSQL bằng tài khoản expense_app có quyền hạn chế.'),
  li('App phơi bày /metrics; Nginx phơi bày stub_status trên cổng nội bộ 8081; postgres-exporter đọc thống kê từ PostgreSQL; cAdvisor đọc metrics container.'),
  li('Prometheus scrape các target mỗi 15 giây; Grafana đọc Prometheus và Loki.'),
  li('Promtail dùng Docker service discovery để đọc log stdout của các container, gắn nhãn service/container và đẩy vào Loki.'),
  h2('2.4. Cấu trúc thư mục dự án'),
  ...code('expense-tracker/\n├── docker-compose.yml\n├── app/            (server.js, Dockerfile, public/)\n├── db/init/        (01-init.sh)\n├── nginx/          (default.conf, certs/)\n├── prometheus/     (prometheus.yml)\n├── grafana/        (provisioning/, dashboards/)\n├── loki/  promtail/\n├── scripts/        (init-env, gen-cert)\n└── README.md'));

// ---------- CH3 ----------
c.push(h1('CHƯƠNG 3. TRIỂN KHAI ỨNG DỤNG, CƠ SỞ DỮ LIỆU VÀ PGADMIN'),
  h2('3.1. Ứng dụng Node.js'),
  p('Ứng dụng được viết bằng Express, sử dụng thư viện pg để truy vấn PostgreSQL và prom-client để xuất metrics. Mọi truy vấn đều dùng tham số ($1, $2…) nhằm chống SQL injection; dữ liệu đầu vào được kiểm tra kiểu, độ dài và định dạng; kích thước body giới hạn 10 KB. Giao diện web gồm HTML/CSS/JavaScript thuần, không dùng innerHTML để tránh XSS và tương thích với Content-Security-Policy nghiêm ngặt.'),
  p('Ứng dụng ghi log dạng JSON ra stdout (thời gian, mức log, phương thức, đường dẫn, mã trạng thái), thuận lợi cho việc phân tích bằng LogQL.'),
  h2('3.2. Dockerfile của ứng dụng'),
  ...code('FROM node:20-alpine\nENV NODE_ENV=production\nWORKDIR /usr/src/app\nCOPY package.json ./\nRUN npm install --omit=dev && npm cache clean --force\nCOPY --chown=node:node server.js ./\nCOPY --chown=node:node public ./public\nUSER node\nEXPOSE 3000\nHEALTHCHECK CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1\nCMD ["node", "server.js"]'),
  h2('3.3. Cơ sở dữ liệu PostgreSQL'),
  p('Lược đồ gồm hai bảng: categories (id, name, type) và transactions (id, category_id, amount, note, occurred_on) với ràng buộc khóa ngoại, CHECK (amount > 0) và CHECK (type IN (\'income\',\'expense\')). Script db/init/01-init.sh chạy một lần khi khởi tạo volume, tạo schema, dữ liệu mẫu và hai role chuyên dụng:'),
  li('expense_app: LOGIN, không superuser; chỉ có SELECT/INSERT/UPDATE/DELETE trên hai bảng và USAGE trên sequence.'),
  li('exporter: chỉ có vai trò pg_monitor để postgres-exporter đọc thống kê.'),
  p('Quyền mặc định trên schema public của PUBLIC bị thu hồi (REVOKE ALL), áp dụng nguyên tắc đặc quyền tối thiểu.'),
  h2('3.4. Công cụ quản lý pgAdmin'),
  p('pgAdmin 4 được triển khai tại http://localhost:5050 (chỉ bind 127.0.0.1) với tài khoản và mật khẩu lấy từ file .env. Người quản trị đăng ký server với host db, port 5432, cơ sở dữ liệu expense để duyệt bảng, chạy truy vấn và sao lưu.'),
  ...fig('web-app', 'Hình 3.1. Giao diện website Expense Tracker', 'chụp https://localhost với dữ liệu mẫu'),
  ...fig('pgadmin', 'Hình 3.2. pgAdmin hiển thị bảng categories và transactions', 'chụp pgAdmin: Servers > expense > Tables, hoặc kết quả SELECT'));

// ---------- CH4 ----------
c.push(h1('CHƯƠNG 4. NGINX REVERSE PROXY VÀ HTTPS (COMMIT 1)'),
  h2('4.1. Chứng chỉ tự ký'),
  p('Chứng chỉ X.509 tự ký (RSA 2048, hiệu lực 365 ngày, SAN gồm localhost và 127.0.0.1) được sinh bằng OpenSSL thông qua script scripts/gen-cert.ps1 hoặc gen-cert.sh. Khóa riêng nằm trong .gitignore để không bị đưa lên GitHub. Trình duyệt sẽ cảnh báo vì chứng chỉ không do CA tin cậy ký, đây là hành vi dự kiến trong môi trường thử nghiệm.'),
  h2('4.2. Cấu hình Nginx'),
  ...code('server { listen 8080; return 301 https://$host:8443$request_uri; }\nserver {\n  listen 8443 ssl;  http2 on;\n  ssl_protocols TLSv1.2 TLSv1.3;\n  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\n  add_header X-Frame-Options "DENY" always;\n  add_header X-Content-Type-Options "nosniff" always;\n  add_header Content-Security-Policy "default-src \'self\'" always;\n  location = /metrics { return 404; }\n  location / { limit_req zone=perip burst=40 nodelay; proxy_pass http://app:3000; }\n}'),
  p('Nginx sử dụng image nginx-unprivileged chạy bằng uid 101 nên lắng nghe ở cổng 8080/8443 trong container và được ánh xạ ra 80/443 trên máy chủ. Access log được định dạng JSON và ghi ra stdout để Promtail thu thập.'),
  h2('4.3. Security headers'),
  table([['Header', 'Tác dụng'],
    ['Strict-Transport-Security', 'Buộc trình duyệt dùng HTTPS'], ['Content-Security-Policy', 'Chỉ cho phép tài nguyên cùng nguồn, giảm rủi ro XSS'],
    ['X-Frame-Options: DENY', 'Chống clickjacking'], ['X-Content-Type-Options: nosniff', 'Chống MIME sniffing'],
    ['Referrer-Policy: no-referrer', 'Không rò rỉ URL nguồn'], ['Permissions-Policy', 'Tắt camera, micro, định vị']]),
  ...fig('https-headers', 'Hình 4.1. HTTPS và security headers (DevTools > Network hoặc curl -kI)', 'chạy: curl.exe -kI https://localhost và chụp kết quả'));

// ---------- CH5 ----------
c.push(h1('CHƯƠNG 5. GIÁM SÁT VỚI PROMETHEUS VÀ GRAFANA (COMMIT 2)'),
  h2('5.1. Các nguồn metrics'),
  table([['Target', 'Công cụ', 'Metric tiêu biểu'],
    ['cadvisor:8080', 'cAdvisor', 'container_cpu_usage_seconds_total, container_memory_working_set_bytes'],
    ['nginx-exporter:9113', 'nginx-prometheus-exporter', 'nginx_connections_active, nginx_http_requests_total'],
    ['postgres-exporter:9187', 'postgres-exporter', 'pg_stat_database_numbackends, pg_stat_database_xact_commit'],
    ['app:3000', 'prom-client', 'http_request_duration_seconds, expense_transactions_created_total']]),
  h2('5.2. Prometheus'),
  p('Prometheus được cấu hình scrape_interval 15 giây, lưu trữ 7 ngày. Trang Status > Targets cho biết trạng thái các target; tất cả phải ở trạng thái UP.'),
  ...fig('prometheus-targets', 'Hình 5.1. Prometheus Targets – tất cả UP', 'chụp http://localhost:9090/targets'),
  h2('5.3. Grafana'),
  p('Grafana được provisioning tự động: datasource Prometheus và Loki, cùng dashboard "Expense Tracker – Overview" gồm các panel CPU/RAM container, kết nối và request Nginx, request ứng dụng theo mã trạng thái, kết nối và giao dịch PostgreSQL, số dịch vụ đang chạy, và panel log từ Loki. Việc provisioning giúp dashboard tái lập hoàn toàn từ mã nguồn.'),
  ...fig('grafana-dashboard', 'Hình 5.2. Dashboard Grafana giám sát container, web server, database', 'chụp dashboard sau khi tạo vài request'),
  p('Ví dụ truy vấn PromQL: rate(nginx_http_requests_total[1m]) cho số request/giây tại Nginx; sum by (name) (rate(container_cpu_usage_seconds_total{name!=""}[1m])) cho CPU theo container.'));

// ---------- CH6 ----------
c.push(h1('CHƯƠNG 6. LOG TẬP TRUNG VỚI LOKI, PROMTAIL VÀ LOGQL (COMMIT 3)'),
  h2('6.1. Kiến trúc log'),
  p('Promtail sử dụng docker_sd_configs để tự động phát hiện các container thuộc compose project expense-tracker, đọc log qua Docker socket (mount chỉ đọc) và gắn nhãn container, service, compose_project. Loki lưu log bằng filesystem với schema TSDB v13, giữ lại 7 ngày. Grafana truy vấn Loki qua Explore.'),
  h2('6.2. Các truy vấn LogQL'),
  table([['#', 'Truy vấn', 'Ý nghĩa'],
    ['1', '{service="app"}', 'Toàn bộ log ứng dụng Node.js'],
    ['2', '{service="nginx"} | json | status >= 400', 'Các request lỗi tại Nginx (đã parse JSON)'],
    ['3', 'sum by (service) (rate({compose_project="expense-tracker"}[1m]))', 'Tốc độ sinh log theo dịch vụ'],
    ['4', '{service="app"} | json | level="error"', 'Lỗi xử lý trong ứng dụng'],
    ['5', '{service="nginx"} | json | request_time > 0.5', 'Request chậm hơn 0,5 giây']]),
  p('Để minh họa, có thể tạo lưu lượng lỗi bằng cách truy cập đường dẫn không tồn tại (ví dụ https://localhost/abc) rồi chạy truy vấn số 2; hoặc POST dữ liệu sai tới /api/transactions để sinh mã 400.'),
  ...fig('logql-1', 'Hình 6.1. Kết quả truy vấn {service="app"}', 'Grafana > Explore > Loki'),
  ...fig('logql-2', 'Hình 6.2. Kết quả truy vấn {service="nginx"} | json | status >= 400', 'Grafana > Explore > Loki'),
  ...fig('logql-3', 'Hình 6.3. Kết quả truy vấn rate theo service', 'Grafana > Explore > Loki, dạng Graph'));

// ---------- CH7 ----------
c.push(h1('CHƯƠNG 7. HARDENING HỆ THỐNG'),
  h2('7.1. Bảng tổng hợp biện pháp'),
  table([['Nhóm', 'Biện pháp', 'Vị trí cấu hình'],
    ['Non-root', 'USER node; nginx-unprivileged; image Prometheus/Grafana/Loki/pgAdmin chạy user riêng', 'app/Dockerfile, docker-compose.yml'],
    ['Network isolation', 'Mạng backend, monitoring dạng internal; DB không publish cổng', 'docker-compose.yml'],
    ['Mật khẩu mạnh', 'Sinh ngẫu nhiên 24 ký tự, lưu .env, đã .gitignore', 'scripts/init-env.*'],
    ['Hạn chế quyền', 'no-new-privileges, cap_drop ALL, read_only', 'docker-compose.yml'],
    ['Least privilege DB', 'Role expense_app chỉ DML; exporter chỉ pg_monitor', 'db/init/01-init.sh'],
    ['Nginx', 'TLS 1.2/1.3, security headers, rate limit, ẩn version, chặn /metrics', 'nginx/default.conf'],
    ['Cổng quản trị', 'pgAdmin, Grafana, Prometheus chỉ bind 127.0.0.1', 'docker-compose.yml'],
    ['Ứng dụng', 'Truy vấn tham số hóa, validate input, không innerHTML', 'app/server.js, public/app.js']]),
  h2('7.2. Kiểm chứng'),
  p('Các lệnh kiểm chứng: docker compose exec app id (kết quả uid=1000 node); docker compose exec nginx id (uid=101); kiểm tra cổng DB không truy cập được từ máy chủ (Test-NetConnection localhost -Port 5432 thất bại); curl -kI https://localhost cho thấy các security headers; docker inspect để xem SecurityOpt, CapDrop và ReadonlyRootfs.'),
  ...code('docker compose exec app id\ndocker compose exec nginx id\ndocker inspect expense-tracker-app-1 --format "{{.HostConfig.CapDrop}} {{.HostConfig.ReadonlyRootfs}}"\ncurl.exe -kI https://localhost'),
  ...fig('hardening-1', 'Hình 7.1. Kiểm tra user non-root và cấu hình container', 'chụp kết quả các lệnh ở trên'),
  h2('7.3. Rủi ro còn lại'),
  li('cAdvisor chạy privileged để đọc cgroup; Promtail chạy root để đọc Docker socket. Nên giới hạn trong môi trường tin cậy hoặc thay bằng docker-socket-proxy.'),
  li('Chứng chỉ tự ký không thích hợp cho môi trường production; nên dùng Let\'s Encrypt.'),
  li('Ứng dụng chưa có xác thực người dùng; cần bổ sung đăng nhập (JWT/session) khi đưa vào sử dụng thực tế.'),
  li('Nên quản lý bí mật bằng Docker secrets hoặc vault thay vì biến môi trường.'));

// ---------- CH8 ----------
c.push(h1('CHƯƠNG 8. QUẢN LÝ MÃ NGUỒN GITHUB VÀ HƯỚNG DẪN CHẠY'),
  h2('8.1. Repository và quy ước commit'),
  p(`Toàn bộ mã nguồn và cấu hình được quản lý trên GitHub (${INFO.github}) với tài khoản và repository đặt theo mã số sinh viên. Lịch sử commit thể hiện rõ từng giai đoạn:`),
  table([['Commit', 'Nội dung'],
    ['1', 'Ứng dụng + PostgreSQL + pgAdmin + Nginx reverse proxy (HTTPS tự ký, security headers)'],
    ['2', 'Prometheus + Grafana + cAdvisor + exporters + dashboard'],
    ['3', 'Loki + Promtail + truy vấn LogQL'],
    ['4', 'README, hardening, báo cáo']]),
  ...fig('github', 'Hình 8.1. Lịch sử commit trên GitHub', 'chụp trang Commits của repository'),
  h2('8.2. Hướng dẫn chạy'),
  ...code('powershell -File scripts/init-env.ps1\npowershell -File scripts/gen-cert.ps1\ndocker compose up -d --build\ndocker compose ps'),
  ...fig('compose-ps', 'Hình 8.2. Kết quả docker compose ps – tất cả container chạy', 'chụp docker compose ps'),
  h2('8.3. Kịch bản demo'),
  li('Mở https://localhost, thêm danh mục và giao dịch, xem báo cáo.'),
  li('Mở pgAdmin, kiểm tra dữ liệu vừa thêm trong bảng transactions.'),
  li('Mở Grafana, xem dashboard thay đổi theo lưu lượng.'),
  li('Chạy các truy vấn LogQL trong Explore.'),
  li('Chạy các lệnh kiểm chứng hardening.'));

// ---------- CH9 ----------
c.push(h1('CHƯƠNG 9. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN'),
  h2('9.1. Kết quả đạt được'),
  p('Đề tài đã xây dựng và triển khai thành công hệ thống Expense Tracker gồm ứng dụng Node.js, cơ sở dữ liệu PostgreSQL và pgAdmin, đặt sau Nginx reverse proxy với HTTPS tự ký và security headers. Hệ thống được giám sát đầy đủ bằng Prometheus và Grafana ở ba tầng container, web server và database; log của tất cả dịch vụ được tập trung vào Loki thông qua Promtail và truy vấn bằng LogQL. Các biện pháp hardening về tài khoản không đặc quyền, cô lập mạng, mật khẩu mạnh, giới hạn quyền container và cấu hình Nginx an toàn đã được áp dụng. Toàn bộ cấu hình được lưu trên GitHub và có thể tái lập bằng Docker Compose.'),
  h2('9.2. Hướng phát triển'),
  li('Bổ sung xác thực người dùng, phân quyền theo hộ gia đình.'),
  li('Thiết lập cảnh báo (Alertmanager) khi container ngừng chạy hoặc DB quá tải.'),
  li('Sao lưu định kỳ PostgreSQL, dùng Let\'s Encrypt và Docker secrets.'),
  li('Tích hợp CI/CD (GitHub Actions) để build và quét lỗ hổng image bằng Trivy.'),
  h2('Tài liệu tham khảo'),
  li('Docker Compose documentation – https://docs.docker.com/compose/'),
  li('Prometheus documentation – https://prometheus.io/docs/'),
  li('Grafana Loki documentation – https://grafana.com/docs/loki/'),
  li('PostgreSQL documentation – https://www.postgresql.org/docs/'),
  li('OWASP Secure Headers Project – https://owasp.org/www-project-secure-headers/'),
  li('Nginx documentation – https://nginx.org/en/docs/'));

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 26 } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT })] })] }) },
    children: c,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(path.join(__dirname, 'BaoCao_ExpenseTracker.docx'), b); console.log('OK'); });
