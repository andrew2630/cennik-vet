import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cennik Vet',
  description: 'Offline app for mobile veterinary pricing and invoicing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pl'>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className='min-h-screen p-4 bg-white dark:bg-gray-900 text-black dark:text-white font-sans antialiased'>
        <main>{children}</main>
      </body>
    </html>
  );
}
