# ========================================
# Multi-stage Dockerfile for RTX System
# Optimized for low-RAM servers (2GB)
# Uses Prisma for database access
# Port: 3006 (3000=OpenGym, 3001=Mazaya)
# ========================================

# syntax=docker/dockerfile:1.7

# 1. Base
FROM node:20-alpine AS base
WORKDIR /app

# 2. Dependencies — separate layer for better caching
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma
# Limit Node memory during install (1GB cap)
ENV NODE_OPTIONS="--max-old-space-size=1024"
# ثبّت الـ deps مع تشغيل postinstall — لازم عشان Prisma ينزّل
# binary الـ schema/query engine الخاص بـ linux-musl (لـ db push على السيرفر).
RUN npm ci

# 3. Builder — compile the Next.js app (most RAM-intensive step)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Cap memory at 1.3GB so the 2GB droplet + swap doesn't OOM
ENV NODE_OPTIONS="--max-old-space-size=1280"
RUN npx prisma generate && npm run build

# 4. Runner (production) — tiny final image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3006
ENV HOSTNAME=0.0.0.0
# Lower cap in production (~110-150MB RAM)
ENV NODE_OPTIONS="--max-old-space-size=512"

# Install OpenSSL 3.x runtime libs (Prisma binary targets linux-musl-openssl-3.0.x)
# Alpine 3.19+ ships with openssl 3.x natively, just need the runtime
RUN apk add --no-cache openssl libc6-compat

# Create non-root user
RUN addgroup --system --gid 1001 nodejs ; adduser --system --uid 1001 nextjs

# Copy built standalone app (server.js + traced node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma 7 standalone tracing does NOT include the generated client or the
# driver adapter, so copy them explicitly.
# 1) Generated Prisma client (lives in src/generated/prisma with new generator)
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma
# 2) Driver adapter + its deps (not traced because imported dynamically)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/adapter-pg ./node_modules/@prisma/adapter-pg
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/driver-adapter-utils ./node_modules/@prisma/driver-adapter-utils
# 3) Prisma runtime that the generated client imports
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
# 4) Prisma CLI + schema + engines (لتنفيذ db push يدوياً على السيرفر)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3006

# الكونتينر يشغّل خادم Next.js فقط.
# مزامنة السكيمة (db push) بتتعمل مرة واحدة على السيرفر بعد أول deploy
# عبر: docker exec rtx sh -c "npx prisma db push --skip-generate --accept-data-loss"
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node server.js"]
