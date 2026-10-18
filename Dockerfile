FROM node:22.14.0-alpine3.21 AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npx esbuild worker/index.ts --bundle --platform=node --format=cjs --outfile=dist/worker.cjs --target=node22
RUN npx esbuild lib/db/migrate.ts --bundle --platform=node --format=cjs --outfile=dist/migrate.cjs --target=node22

FROM node:22.14.0-alpine3.21 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S assured && adduser -S assured -G assured \
  && apk add --no-cache wget
COPY --from=builder --chown=assured:assured /app/public ./public
COPY --from=builder --chown=assured:assured /app/.next/standalone ./
COPY --from=builder --chown=assured:assured /app/.next/static ./.next/static
COPY --from=builder --chown=assured:assured /app/dist/worker.cjs ./worker.cjs
COPY --from=builder --chown=assured:assured /app/dist/migrate.cjs ./migrate.cjs
COPY --from=builder --chown=assured:assured /app/drizzle ./drizzle
COPY --from=builder --chown=assured:assured /app/package.json ./package.json
USER assured
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health/live >/dev/null || exit 1
CMD ["node", "server.js"]
