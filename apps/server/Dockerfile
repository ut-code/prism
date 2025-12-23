# Build from repo root: docker build -t prism-server -f apps/server/Dockerfile .
FROM oven/bun:1.3.2 AS builder
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/desktop/package.json ./apps/desktop/
COPY apps/server/package.json ./apps/server/
COPY packages/api-client/package.json ./packages/api-client/
RUN bun install --frozen-lockfile --ignore-scripts
# Copy source files individually to preserve node_modules created by bun install
COPY apps/server/src ./apps/server/src
COPY apps/server/drizzle ./apps/server/drizzle
COPY apps/server/drizzle.config.ts ./apps/server/drizzle.config.ts
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
RUN cd apps/server && bun build src/index.ts --outdir dist --target bun

FROM oven/bun:1.3.2
WORKDIR /app/apps/server
ENV NODE_ENV=production
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ../../node_modules
COPY --from=builder /app/apps/server/node_modules ./node_modules
# Copy files needed for drizzle-kit push
COPY --from=builder /app/apps/server/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/apps/server/src ./src
EXPOSE 3000
CMD ["sh", "-c", "bunx drizzle-kit push && bun run dist/index.js"]
