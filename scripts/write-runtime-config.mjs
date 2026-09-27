import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const app = process.argv[2];

if (!['storefront', 'admin'].includes(app)) {
  throw new Error('Expected app name: storefront or admin');
}

const apiBaseUrl =
  process.env.MARKET_API_BASE_URL?.trim()
  || 'https://fakestoreapi.com';

if (!/^(https?:\/\/|\/api\/)/.test(apiBaseUrl)) {
  throw new Error(
    'MARKET_API_BASE_URL must be an http(s) URL or an /api/... path',
  );
}

const target = resolve(
  process.cwd(),
  'apps',
  app,
  'src',
  'assets',
  'runtime-config.js',
);

await mkdir(resolve(target, '..'), { recursive: true });
await writeFile(
  target,
  `globalThis.__MARKET_CONFIG__ = ${JSON.stringify(
    { apiBaseUrl },
    null,
    2,
  )};\n`,
  'utf8',
);
