# Stage 1: Build static assets
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Định nghĩa các build arguments cho Vite
ARG VITE_API_BASE_URL
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_HOST
ARG VITE_PUSHER_PORT
ARG VITE_PUSHER_FORCE_TLS

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY \
    VITE_PUSHER_HOST=$VITE_PUSHER_HOST \
    VITE_PUSHER_PORT=$VITE_PUSHER_PORT \
    VITE_PUSHER_FORCE_TLS=$VITE_PUSHER_FORCE_TLS

RUN npm run build

# Stage 2: Serve assets with Nginx (image cuối chỉ ~25MB)
FROM nginx:alpine
RUN rm -rf /etc/nginx/conf.d/* \
    && echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"; \
    } \
    location /assets/ { \
        root /usr/share/nginx/html; \
        expires 1y; \
        add_header Cache-Control "public, no-transform"; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
