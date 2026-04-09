# ── Etapa 1: build ──────────────────────────────────────────
FROM node:20-slim AS builder

# Instalar dependencias para compilar módulos nativos (Debian style)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# ── Etapa 2: serve ──────────────────────────────────────────
FROM node:20-slim

WORKDIR /app
# Copiamos todo lo construido, incluyendo node_modules con el binario compilado
COPY --from=builder /app ./

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["npm", "start"]
