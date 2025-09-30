# Dockerfile for Next.js app

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY packages/web/package.json ./
RUN npm install -g pnpm && pnpm install

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages/web ./
COPY packages/shared ../shared
RUN npm install -g pnpm && pnpm build

# Production image
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
