import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const basePath = process.env.BASE_PATH || '/cennik-vet';

const baseConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  trailingSlash: true,
};

const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: {
    image: '/fallback.png',
    document: '/offline.html',
  },
};

export default withPWA(pwaConfig)(
  withNextIntl(baseConfig)
);
