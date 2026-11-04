# ==============================================================================
# Agent Crash Test — Frontend Dockerfile (Phase 1 Foundation)
# Multi-stage build with Nginx for production, or Vite dev server
# ==============================================================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite SPA with production assets
RUN npm run build

# ------------------------------------------------------------------------------
# Production Nginx Serving Stage
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx configuration for SPA client routing and API reverse proxy
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:8000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
    CMD wget -q --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
