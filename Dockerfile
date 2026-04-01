# ==========================================
# 🐳 Dockerfile — Build Multi-stage Nuxt 4
# ==========================================

# 1. Base stage: Node.js 22 LTS Alpine + pnpm
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
# Eliminamos el script de husky para que no falle al no encontrar .git en Docker
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    npm pkg delete scripts.prepare && \
    pnpm install --frozen-lockfile

# 3. Builder stage (Producción)
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# 4. Runner stage (Producción)
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copiamos solo los archivos de salida generados por Nitro / Nuxt
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Ejecutar el servidor SSR de producción
CMD ["node", ".output/server/index.mjs"]
