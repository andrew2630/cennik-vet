import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const basePath = process.env.BASE_PATH || '/cennik-vet';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const baseConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
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

export default withPWA(pwaConfig)(withNextIntl(baseConfig));
