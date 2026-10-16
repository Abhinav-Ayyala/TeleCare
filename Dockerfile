# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-slim

# Install Python + pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node backend deps
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built React app into the location Express serves it from
COPY --from=frontend-builder /app/client/dist ./client/dist

# Install Python AI service deps
COPY ai-service/requirements.txt ./ai-service/
RUN python3 -m pip install --no-cache-dir --break-system-packages -r ai-service/requirements.txt

# Copy AI service source
COPY ai-service/ ./ai-service/

# Create data directory for SQLite
RUN mkdir -p /app/server/data

# Startup script
COPY start-prod.sh ./
RUN chmod +x start-prod.sh

ENV NODE_ENV=production
ENV AI_SERVICE_URL=http://localhost:8000

EXPOSE 8080

CMD ["./start-prod.sh"]
