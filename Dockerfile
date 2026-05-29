FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:all

# ---

FROM node:22-slim AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Built frontend (Vite output)
COPY --from=builder /app/dist ./dist

# Compiled server
COPY --from=builder /app/dist/server ./dist/server

# schema.sql must live at server/db/schema.sql relative to cwd
COPY server/db/schema.sql ./server/db/schema.sql

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Seed on first run (idempotent — skips if questions already exist), then start
CMD ["sh", "-c", "node dist/server/db/seed.js && node dist/server/index.js"]
