# ============================================
# Stage 1: Install ALL dependencies for build
# ============================================
FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ============================================
# Stage 2: Install PRODUCTION deps only
# ============================================
FROM oven/bun:1-alpine AS prod-deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production && \
    find node_modules -name "*.d.ts" -delete 2>/dev/null || true && \
    find node_modules -name "*.map" -delete 2>/dev/null || true && \
    find node_modules -name "*.md" -delete 2>/dev/null || true && \
    find node_modules -name "LICENSE*" -delete 2>/dev/null || true && \
    find node_modules -name "README*" -delete 2>/dev/null || true && \
    find node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf node_modules/.cache 2>/dev/null || true

# ============================================
# Stage 3: Build the application
# ============================================
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY . .

ENV NODE_ENV=production

RUN bun run build

# ============================================
# Stage 4: Production runner (minimal Alpine)
# ============================================
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["bun", "dist/src/main.js"]
