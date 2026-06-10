
ARG NODE_VERSION=24-alpine3.21

# ──────────────────────── STAGE 1 — BASE ───────────────────────────

FROM node:${NODE_VERSION} AS base

RUN apk add --no-cache openssl && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma


# ─────────────────────── STAGE 2 — DEVELOPMENT ────────────────────

FROM base AS development

ENV NODE_ENV=development

RUN npm ci

RUN npx prisma generate

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
CMD ["dev"]



# ──────────────────────── STAGE 3 — PRODUCTION ────────────────────

FROM base AS production

ENV NODE_ENV=production

RUN npm ci --omit=dev

RUN npx prisma generate

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
CMD ["start"]






