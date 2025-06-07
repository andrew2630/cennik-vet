import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/cennik-vet',
  trailingSlash: true,
};

export default withPWA(
  withNextIntl({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    fallbacks: {
      image: '/fallback.png',
      document: '/offline.html', // <- ważne!
    },
  })
)(nextConfig);
