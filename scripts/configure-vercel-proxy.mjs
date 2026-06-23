import { readFileSync, writeFileSync } from 'node:fs';

const backendUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, '');

if (!backendUrl) {
  console.log('[vercel-proxy] BACKEND_API_URL não definida — proxy /api não configurado.');
  process.exit(0);
}

const vercelPath = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(readFileSync(vercelPath, 'utf8'));

config.rewrites = [
  { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
  ...(config.rewrites ?? []).filter((rewrite) => !String(rewrite.source).startsWith('/api/')),
];

writeFileSync(vercelPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`[vercel-proxy] Proxy /api/* -> ${backendUrl}/api/*`);
