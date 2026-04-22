ARG NODE_VERSION=20-alpine

# ──────────────────────── STAGE 1 — BASE ───────────────────────────

FROM node:${NODE_VERSION} AS base

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

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]  
