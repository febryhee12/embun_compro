import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationJsonLd } from '@/lib/seo/structuredData';
import { ThemeProvider } from '@/components/theme-provider';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { CookieConsent } from '@/components/ui/CookieConsent';
import '../globals.css';

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const siteTitle = 'Embun';
const siteDescription =
  'Embun — platform yang menghubungkan tamu dengan campsite terbaik, sekaligus membantu pemilik campsite mengelola reservasi dan komisi secara otomatis.';

export const metadata: Metadata = {
  metadataBase: new URL('https://embun.app'),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export async function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html
      lang={lang}
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <JsonLd data={buildOrganizationJsonLd()} />
          {children}
          <ScrollToTop />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
