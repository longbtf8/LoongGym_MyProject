# 📖 HƯỚNG DẪN TRIỂN KHAI DỰ ÁN LOONGGYM (MONOREPO) LÊN VPS UBUNTU

Tài liệu này cung cấp quy trình chuẩn hóa chi tiết từng bước để cấu hình, đóng gói và triển khai toàn bộ dự án LoongGym lên máy chủ VPS Google Cloud (`8.235.32.203`).

---

## 🌐 BẢN ĐỒ PHÂN BỔ TÊN MIỀN (DNS CONFIGURATION)

Trước khi thực hiện các bước trên VPS, hãy truy cập trang quản trị tên miền của bạn (ví dụ: Cloudflare, Mắt Bão...) và tạo các bản ghi sau:

| Loại bản ghi | Tên (Host) | Giá trị (Trỏ về IP) | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **A** | `@` (hoặc `loongmilk.id.vn`) | `8.235.32.203` | Trang giao diện người dùng (Frontend) |
| **A** | `www` | `8.235.32.203` | Bí danh cho trang giao diện người dùng |
| **A** | `api` | `8.235.32.203` | Điểm kết nối Backend API Server |
| **A** | `admin` | `8.235.32.203` | Trang giao diện quản trị (Admin Panel) |
| **A** | `ws` | `8.235.32.203` | Máy chủ kết nối WebSocket (Soketi) |

---

## 🛠️ BƯỚC 1: KẾT NỐI SSH VÀO VPS GOOGLE CLOUD

Mở Terminal trên máy Mac của bạn và chạy lệnh sau để kết nối:

```bash
ssh builong3122005@8.235.32.203
```
*(Hệ thống sử dụng chìa khóa bảo mật SSH Key `id_rsa` đã lưu trên máy Mac của bạn nên sẽ tự động đăng nhập không cần hỏi mật khẩu).*

---

## 📦 BƯỚC 2: CÀI ĐẶT DOCKER, DOCKER COMPOSE & GIT TRÊN VPS

Sau khi kết nối vào VPS thành công, lần lượt thực hiện các lệnh sau:

### 1. Cập nhật hệ thống VPS
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 2. Cài đặt các gói phụ trợ và cấu hình Docker Repository
```bash
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 3. Cài đặt Docker Engine và Docker Compose V2
```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
```

### 4. Cấu hình quyền chạy Docker (không cần gõ `sudo`)
```bash
sudo usermod -aG docker builong3122005
```
> [!IMPORTANT] 📌
> BẮT BUỘC: Gõ lệnh `exit` để ngắt kết nối SSH hiện tại, sau đó kết nối lại bằng `ssh builong3122005@8.235.32.203` để cấu hình nhóm quyền Docker có hiệu lực.

---

## 📂 BƯỚC 3: CLONE MÃ NGUỒN VỀ VPS

Tạo thư mục làm việc và tải toàn bộ dự án từ Git về máy chủ VPS:

```bash
mkdir -p ~/app && cd ~/app
git clone https://github.com/longbtf8/LoongGym_MyProject.git LoongMilKGymProject
cd LoongMilKGymProject
```

---

## 🔐 BƯỚC 4: THIẾT LẬP FILE BIẾN MÔI TRƯỜNG (.ENV) CHO DỰ ÁN

Vì dự án chạy trong môi trường Container hóa, chúng ta cần cấu hình tệp môi trường cho cả 3 phân hệ.

### 1. Cấu hình Backend (`LoongMilkGym_MyProject_BackEnd/.env.docker`)

Backend sử dụng một tệp đặc biệt tên là `.env.docker` để kết nối nội bộ với CSDL MySQL và Soketi WebSocket qua mạng Docker (Bridge Network):

Tạo hoặc chỉnh sửa tệp tin này bằng trình soạn thảo Nano:
```bash
nano LoongMilkGym_MyProject_BackEnd/.env.docker
```

Dán nội dung cấu hình chuẩn hóa dưới đây:

```ini
# ENV
NODE_ENV=production

# DATABASE (Kết nối với container "loonggym_mysql" thông qua cổng 3306)
DATABASE_URL="mysql://<db_user>:<db_password_urlencoded>@db:3306/<db_name>"
DATABASE_USER="<db_user>"
DATABASE_PASSWORD="<db_password>"
DATABASE_NAME="<db_name>"
DATABASE_HOST="db"
DATABASE_PORT=3306

# AUTH JWT SECRET KEYS
JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES_IN=1h
AUTH_REFRESH_TOKEN="7"
AUTH_VERIFICATION_JWT_SECRET=<your_verification_jwt_secret_key>
AUTH_VERIFICATION_EXPIRES_IN=1h
AUTH_PASSWORD_RESET_EXPIRES_IN=15

# SMTP MAIL SERVER CONFIG
MAIL_APP_PASSWORD="<your_smtp_app_password>"
MAIL_FROM_ADDRESS=<your_email_address>
MAIL_FROM_NAME="LoongMilkGYM"

# DOMAIN URLS FOR CORS & REDIRECTS (Trỏ về subdomain thật của bạn)
FRONTEND_URL=https://loongmilk.id.vn
ADMIN_URL=https://admin.loongmilk.id.vn

# CLOUDINARY CONFIG
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

# WEBSOCKET (Kết nối trực tiếp sang container "loonggym_soketi" qua mạng nội bộ Docker)
PUSHER_APP_ID=<pusher_app_id>
PUSHER_APP_KEY=<pusher_app_key>
PUSHER_APP_SECRET=<pusher_app_secret>
PUSHER_HOST=soketi
PUSHER_PORT=6002
PUSHER_USE_TLS=false

# AI COACH CONFIG (Vercel AI Gateway)
AI_GATEWAY_API_KEY=<your_ai_gateway_api_key>
AI_MODEL=openai/gpt-4o-mini
AI_MAX_TOKENS=1024

# DB BACKUP CONFIGURATION (Backup local trong container & đồng bộ qua Rclone)
DB_BACKUP_LOCAL_DIR="./src/storage/DBBackup"
DB_BACKUP_REMOTE="LoongMilkGymBackupDB"
DB_BACKUP_REMOTE_DIR="DBLoongMilkGym"

# Rclone Google Drive Config Variables
# Giải quyết vấn đề rclone trên máy mới: Tự động khởi tạo cấu hình Google Drive mà không cần file cấu hình rclone.conf
RCLONE_CONFIG_LOONGMILKGYMBACKUPDB_TYPE=drive
RCLONE_CONFIG_LOONGMILKGYMBACKUPDB_SCOPE=drive
RCLONE_CONFIG_LOONGMILKGYMBACKUPDB_TOKEN='<your_rclone_google_drive_json_token_here>'
```

*(Lưu lại bằng cách ấn `Ctrl + O` -> `Enter` -> `Ctrl + X`)*

### 2. Cấu hình Frontend (`LoongMilkGym_MyProject_FrontEnd/.env.production`)
Tạo tệp biến môi trường cho Frontend:
```bash
nano LoongMilkGym_MyProject_FrontEnd/.env.production
```

Dán nội dung sau:
```ini
VITE_API_BASE_URL="https://api.loongmilk.id.vn/api"

# Pusher/Soketi Config
VITE_PUSHER_APP_KEY=GYM_CHAT_APP
VITE_PUSHER_HOST=ws.loongmilk.id.vn
VITE_PUSHER_PORT=443
VITE_PUSHER_FORCE_TLS=true
```

### 3. Cấu hình Admin (`LoongMilkGym_MyProject_Admin/.env.production`)
Tạo tệp biến môi trường cho Admin:
```bash
nano LoongMilkGym_MyProject_Admin/.env.production
```

Dán nội dung sau:
```ini
VITE_API_BASE_URL="https://api.loongmilk.id.vn/api"

# Pusher/Soketi Config
VITE_PUSHER_APP_KEY=GYM_CHAT_APP
VITE_PUSHER_HOST=ws.loongmilk.id.vn
VITE_PUSHER_PORT=443
VITE_PUSHER_FORCE_TLS=true
```

---

## 🚀 BƯỚC 5: KHỞI CHẠY DỰ ÁN BẰNG DOCKER COMPOSE

Từ thư mục gốc chứa file `docker-compose.prod.yml`, chạy lệnh sau để build và dựng các container:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 1. Kiểm tra trạng thái các container
```bash
docker ps
```
Bạn sẽ thấy 5 container: `loonggym_mysql`, `loonggym_soketi`, `loonggym_backend`, `loonggym_frontend`, và `loonggym_admin` đều ở trạng thái **Up**.

### 2. Đẩy cấu hình DB (Prisma Migrate & Seed dữ liệu mẫu)
Sau khi container MySQL khởi động xong, chạy các lệnh sau để chuẩn bị CSDL:

```bash
# Đồng bộ cấu hình schema xuống MySQL
docker exec -it loonggym_backend npx prisma db push

# Chạy seed dữ liệu nền tảng cho thư viện bài tập, thực đơn và sản phẩm
docker exec -it loonggym_backend node src/seeds/seed-exercises-v2.js
docker exec -it loonggym_backend node src/seeds/seed-foods.js
docker exec -it loonggym_backend node src/seeds/seed-products-v5.js
```

---

## 🔒 BƯỚC 6: CÀI ĐẶT NGINX LÀM REVERSE PROXY VÀ THIẾT LẬP SSL HTTPS

Để điều hướng lưu lượng truy cập từ Internet vào đúng các container Docker đang chạy ngầm, chúng ta cài đặt Nginx trên host VPS.

### 1. Cài đặt Nginx
```bash
sudo apt install -y nginx
```

### 2. Tạo file cấu hình chuyển hướng tên miền
```bash
sudo nano /etc/nginx/sites-available/loonggym
```

Dán nội dung cấu hình dưới đây:

```nginx
# ==========================================================
# 1. FRONTEND USER (https://loongmilk.id.vn)
# ==========================================================
server {
    listen 80;
    server_name loongmilk.id.vn www.loongmilk.id.vn;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==========================================================
# 2. ADMIN PANEL (https://admin.loongmilk.id.vn)
# ==========================================================
server {
    listen 80;
    server_name admin.loongmilk.id.vn;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==========================================================
# 3. BACKEND API SERVER (https://api.loongmilk.id.vn)
# ==========================================================
server {
    listen 80;
    server_name api.loongmilk.id.vn;

    location / {
        proxy_pass http://127.0.0.1:3009;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==========================================================
# 4. SOKETI WEBSOCKETS (wss://ws.loongmilk.id.vn)
# ==========================================================
server {
    listen 80;
    server_name ws.loongmilk.id.vn;

    location / {
        proxy_pass http://127.0.0.1:6002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

*(Lưu lại bằng cách ấn `Ctrl + O` -> `Enter` -> `Ctrl + X`)*

### 3. Kích hoạt và chạy Nginx
```bash
# Tạo liên kết cấu hình sang thư mục sites-enabled
sudo ln -s /etc/nginx/sites-available/loonggym /etc/nginx/sites-enabled/

# Kiểm tra cú pháp xem có bị lỗi không
sudo nginx -t

# Khởi động lại Nginx
sudo systemctl restart nginx
```

### 4. Cài đặt Certbot và tự động cấp chứng chỉ SSL bảo mật HTTPS
```bash
sudo apt install -y certbot python3-certbot-nginx

# Chạy Certbot để xin cấp chứng chỉ SSL miễn phí từ Let's Encrypt
sudo certbot --nginx -d loongmilk.id.vn -d www.loongmilk.id.vn -d api.loongmilk.id.vn -d ws.loongmilk.id.vn -d admin.loongmilk.id.vn
```
- Khi chạy lệnh trên, Certbot sẽ yêu cầu điền Email của bạn và hỏi bạn có đồng ý các điều khoản sử dụng không.
- Certbot sẽ tự động cấu hình lại file Nginx trên host VPS để mã hóa TLS/SSL toàn bộ traffic và tự động chuyển hướng HTTP sang HTTPS một cách bảo mật.

---

## 🔄 BƯỚC 7: QUY TRÌNH CẬP NHẬT CODE NHANH (CI/CD BẰNG CƠM)

Khi bạn đẩy code mới từ máy local lên GitHub, hãy SSH vào VPS và chạy chuỗi lệnh sau để cập nhật dự án không gián đoạn:

```bash
cd ~/app/LoongMilKGymProject

# 1. Tải code mới nhất từ nhánh main
git pull origin main

# 2. Build lại các container bị thay đổi
docker compose -f docker-compose.prod.yml up -d --build
```
Docker sẽ tự động phân tích các layer cache, chỉ rebuild các phần code thay đổi và khởi động lại container tương ứng mà không làm sập các container khác.

---

## 📝 GIẢI THÍCH CHI TIẾT VỀ CƠ CHẾ HOẠT ĐỘNG TRÊN VPS

### 1. Soketi WebSocket (Realtime Chat) hoạt động như thế nào?
- Container `loonggym_soketi` lắng nghe cổng `6002` trong mạng Docker.
- Nginx proxy bên ngoài lắng nghe subdomain `ws.loongmilk.id.vn` trên cổng `443` (HTTPS) và chuyển tiếp WebSocket traffic xuống cổng `6002` của Soketi container.
- Frontend kết nối realtime bằng giao thức bảo mật `wss://ws.loongmilk.id.vn:443`.

### 2. Rclone Backup hoạt động như thế nào trên môi trường mới?
- Bạn không cần cài đặt rclone lên máy chủ VPS.
- `rclone` và `mariadb-client` đã được tích hợp sẵn bên trong container Backend (`loonggym_backend`).
- Các biến môi trường `RCLONE_CONFIG_LOONGMILKGYMBACKUPDB_TOKEN` và các thông tin liên quan truyền từ file `.env.docker` giúp Rclone trong container nhận diện trực tiếp kết nối với Google Drive của bạn mà không cần chạy lệnh `rclone config` thủ công.
- Đúng 3:00 sáng Chủ nhật, cron job `backupDB.js` sẽ chạy `mysqldump` xuất file dữ liệu ra thư mục tạm `/app/src/storage/DBBackup` bên trong container rồi tự động gọi `rclone` đồng bộ lên thư mục `DBLoongMilkGym` trên Google Drive.
