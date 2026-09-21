# ──────────────────────────────────────────────────────────────
# Frontend Dockerfile — Vite build → Nginx static serving
# ──────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time env: API calls go to /api and are proxied by nginx → backend
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing + API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
