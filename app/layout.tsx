import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'ZCAR - Ethiopia\'s Premier Vehicle & Property Marketplace',
    template: '%s | ZCAR Marketplace',
  },
  description: 'Find your perfect vehicle or property in Ethiopia. Browse thousands of listings for cars, SUVs, apartments, houses, and more on ZCAR Marketplace.',
  keywords: ['cars', 'vehicles', 'properties', 'real estate', 'Ethiopia', 'Addis Ababa', 'marketplace', 'buy', 'sell'],
  authors: [{ name: 'ZCAR' }],
  creator: 'ZCAR',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zcar.et',
    siteName: 'ZCAR Marketplace',
    title: 'ZCAR - Ethiopia\'s Premier Vehicle & Property Marketplace',
    description: 'Find your perfect vehicle or property in Ethiopia. Browse thousands of listings on ZCAR Marketplace.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ZCAR Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZCAR Marketplace',
    description: 'Ethiopia\'s Premier Vehicle & Property Marketplace',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
