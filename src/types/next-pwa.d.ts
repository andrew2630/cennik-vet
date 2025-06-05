declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: string[];
    scope?: string;
    sw?: string;
    swSrc?: string;
    swDest?: string;
    runtimeCaching?: unknown[];
    fallbacks?: {
      image?: string;
      document?: string;
      font?: string;
      audio?: string;
      video?: string;
      worker?: string;
    };
  }

  export default function withPWA(
    options: PWAOptions
  ): (nextConfig: NextConfig) => NextConfig;
}
