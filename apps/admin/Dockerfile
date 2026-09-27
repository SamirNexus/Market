FROM node:20-bookworm-slim AS build

WORKDIR /workspace

COPY apps/admin/package.json apps/admin/package-lock.json ./apps/admin/
RUN npm ci --prefix apps/admin --no-audit --no-fund

COPY packages/contracts ./packages/contracts
COPY scripts ./scripts
COPY apps/admin ./apps/admin

RUN npm --prefix apps/admin run build

FROM nginx:1.27-alpine AS runtime

ENV API_BASE_URL=/api/v1

COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY deploy/frontend-entrypoint.sh /docker-entrypoint.d/40-market-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-market-runtime-config.sh

COPY --from=build /workspace/apps/admin/dist/app /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
