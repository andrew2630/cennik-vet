import type { Metadata } from 'next';
import './globals.css';
import { SparklesCore } from '@/components/ui/sparkles';
import HomeButton from '@/components/HomeButton';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Cennik Vet',
  description: 'Aplikacja offline do rozliczeń weterynaryjnych.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pl'>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/icon-192.png' />
        <meta name='theme-color' content='#4f46e5' />
      </head>
      <body className='min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white font-sans antialiased'>
        <SparklesCore className='absolute inset-0 h-full w-full z-0' particleColor='#86efac' />
        <main className='relative z-10 p-4'>{children}</main>
        <Toaster richColors position="top-right" />
        <HomeButton />
      </body>
    </html>
  );
}
