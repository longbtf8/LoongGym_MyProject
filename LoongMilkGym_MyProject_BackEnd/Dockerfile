# =============================================
# Stage 1: BUILD - Cài đặt deps + generate Prisma
# =============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN DATABASE_URL="mysql://localhost:3306/db" npx prisma generate

# =============================================
# Stage 2: PRODUCTION - Image cuối cùng siêu nhẹ
# =============================================
FROM node:22-alpine

# Cài đặt rclone và mariadb-client để hỗ trợ backup CSDL
# Cài đặt PM2 toàn cục để quản lý các tiến trình chạy ngầm
RUN apk add --no-cache rclone mariadb-client \
    && npm install -g pm2

WORKDIR /app

# Chỉ copy package files và cài production deps (nhẹ hơn ~60%)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma Client đã generate từ stage builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/generated ./generated

# Copy mã nguồn và cấu hình PM2
COPY . .

EXPOSE 3009

CMD ["pm2-runtime", "ecosystem.config.js"]
