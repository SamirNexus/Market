FROM node:20-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build

COPY apps/api/nest-cli.json apps/api/tsconfig.json apps/api/tsconfig.build.json ./
COPY apps/api/prisma ./prisma
COPY apps/api/src ./src

RUN npm run prisma:generate
RUN npm run build

FROM deps AS migration

COPY apps/api/prisma ./prisma

CMD ["npm", "run", "prisma:migrate:deploy"]

FROM node:20-bookworm-slim AS production-deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/dist ./dist
COPY apps/api/prisma ./prisma
COPY apps/api/package.json ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/v1/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"]

CMD ["node", "dist/main.js"]
