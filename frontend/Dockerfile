ARG NODE_VERSION=22-alpine

# ───────── BASE ─────────
FROM node:${NODE_VERSION} AS base
WORKDIR /app
COPY package*.json ./

# ───────── DEV ─────────
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ───────── BUILD ─────────
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ───────── PRODUCTION ─────────
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]