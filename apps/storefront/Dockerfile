FROM node:20-bookworm-slim AS build

WORKDIR /workspace

COPY apps/storefront/package.json apps/storefront/package-lock.json ./apps/storefront/
RUN npm ci --prefix apps/storefront --no-audit --no-fund

COPY packages/contracts ./packages/contracts
COPY apps/storefront ./apps/storefront

RUN npm --prefix apps/storefront run build

FROM nginx:1.27-alpine AS runtime

ENV API_BASE_URL=/api/v1

COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY deploy/frontend-entrypoint.sh /docker-entrypoint.d/40-market-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-market-runtime-config.sh

COPY --from=build /workspace/apps/storefront/dist/app /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
