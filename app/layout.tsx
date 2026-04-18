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
    default: 'EagleList - Ethiopia\'s Premier Vehicle & Property Marketplace',
    template: '%s | EagleList',
  },
  description: 'Find your perfect vehicle or property in Ethiopia. Browse thousands of listings for cars, SUVs, apartments, houses, and more on EagleList.',
  keywords: ['cars', 'vehicles', 'properties', 'real estate', 'Ethiopia', 'Addis Ababa', 'marketplace', 'buy', 'sell'],
  authors: [{ name: 'EagleList' }],
  creator: 'EagleList',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zcar.et',
    siteName: 'EagleList',
    title: 'EagleList - Ethiopia\'s Premier Vehicle & Property Marketplace',
    description: 'Find your perfect vehicle or property in Ethiopia. Browse thousands of listings on EagleList.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EagleList',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EagleList',
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
