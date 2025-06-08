import type { Metadata } from 'next';
import './globals.css';
import { SparklesCore } from '@/components/ui/sparkles';
import HomeButton from '@/components/HomeButton';
import { Toaster } from 'sonner';
import BuyMeCoffee from '@/components/BuyMeCoffee';
import InstallPrompt from '@/components/InstallPrompt';
import PageWrapper from '@/components/PageWrapper';

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
    <html lang='pl' suppressHydrationWarning>
      <head>
        {/* Prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        {(() => {
          const base = process.env.NEXT_PUBLIC_BASE_PATH || '/cennik-vet';
          return (
            <>
              <link rel='manifest' href={`${base}/manifest.json`} />
              <link rel='apple-touch-icon' href={`${base}/icon-192.png`} />
            </>
          );
        })()}
        <meta name='theme-color' content='#0A0A0A' />
      </head>
      <body className='min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white font-sans antialiased'>
        <SparklesCore className='absolute inset-0 h-full w-full z-0' particleColor='#86efac' />
        <main className='relative z-10 p-4'>{children}</main>
        <Toaster richColors position='top-right' />
        <HomeButton />
        <BuyMeCoffee />
        <PageWrapper>
          <InstallPrompt />
        </PageWrapper>
      </body>
    </html>
  );
}
