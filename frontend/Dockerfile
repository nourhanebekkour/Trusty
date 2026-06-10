ARG NODE_VERSION=24-alpine3.21

# ──────────────────────── STAGE 1 — BASE ───────────────────────────

FROM node:${NODE_VERSION} AS base

RUN apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./

RUN npm ci

# ─────────────────────── STAGE 2 — DEVELOPMENT ────────────────────

FROM base AS development  

ENV NODE_ENV=development 

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]

# ──────────────────────── STAGE 3 — PRODUCTION (build) ────────────────────

FROM base AS build

ENV NODE_ENV=production

COPY . .

RUN npm run build 

# ──────────────────────── STAGE 4 — PRODUCTION (Nginx) ────────────────────

FROM nginx:1.31-alpine3.23 AS production

RUN apk upgrade --no-cache

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]  
