
ARG NODE_VERSION=20-alpine     

# ──────────────────────── STAGE 1 — BASE ───────────────────────────


FROM node:${NODE_VERSION} AS base

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

COPY prisma ./prisma

RUN npx prisma generate


# ─────────────────────── STAGE 2 — DEVELOPMENT ────────────────────

FROM base AS development

ENV NODE_ENV=development

RUN npm ci   

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]



# ──────────────────────── STAGE 3 — PRODUCTION ────────────────────

FROM base AS production

ENV NODE_ENV=production

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]














