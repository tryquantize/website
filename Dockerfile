# Multi-stage build for Node.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Development stage
FROM base AS dev
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose port
EXPOSE 3001

# Build the frontend
RUN yarn build

# Start the API server (will serve built frontend)
CMD ["yarn", "tsx", "apps/api/index.ts"]

# Production build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "apps/api/index.js"]