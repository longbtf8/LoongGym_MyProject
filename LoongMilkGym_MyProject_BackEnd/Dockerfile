FROM node:18-alpine

# Cài đặt rclone và mariadb-client để hỗ trợ backup CSDL
RUN apk add --no-cache rclone mariadb-client

# Cài đặt PM2 toàn cục để quản lý các tiến trình chạy ngầm
RUN npm install -g pm2

WORKDIR /app

# Copy package files để tối ưu hóa cache
COPY package*.json ./

# Cài đặt các gói phụ thuộc
RUN npm install --production=false

# Copy mã nguồn
COPY . .

# Khởi tạo Prisma Client
RUN DATABASE_URL="mysql://localhost:3306/db" npx prisma generate

# Expose cổng kết nối của API Server
EXPOSE 3009

# Khởi chạy 3 tiến trình thông qua PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
