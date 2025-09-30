# Client Dockerfile
# Multi-stage build for the React frontend

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies earlier to leverage caching
COPY ../../package.json ../../yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY ../../packages/client ./packages/client
COPY ../../vite.config.ts ../../tsconfig.json ../../tailwind.config.ts ../../postcss.config.js ../../components.json ./

# Build the application (use yarn so local bin is on PATH)
RUN yarn vite build

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Copy nginx configuration
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
