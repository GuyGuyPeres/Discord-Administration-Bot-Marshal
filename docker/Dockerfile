FROM node:20-slim AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-slim

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

VOLUME ["/app/data"]

# Considered healthy as long as the bot has updated its heartbeat file in the
# last 3 minutes (written every 60s while connected - see src/utils/heartbeat.js).
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "const fs=require('fs');try{const age=Date.now()-fs.statSync('/app/data/.heartbeat').mtimeMs;process.exit(age<180000?0:1)}catch(e){process.exit(1)}"

CMD ["node", "src/index.js"]
