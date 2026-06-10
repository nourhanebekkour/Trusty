ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
RUN apk add --no-cache openssl && apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

FROM base AS production
ENV NODE_ENV=production

RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

COPY . .

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
CMD ["start"]