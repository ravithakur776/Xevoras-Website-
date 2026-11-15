import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/store/cartContext';
import { WishlistProvider } from '@/lib/store/wishlistContext';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { BrandIntroModal } from '@/components/storefront/BrandIntroModal';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://xevoras.com'),
  title: 'XEVORAS — Always Rare | Premium Contemporary Fashion & 3D Avatar Studio',
  description:
    'Discover elevated essentials, column gowns, weighted shirts, and 3D digital avatar customization at XEVORAS. India-wide express delivery and seamless AI Virtual Try-On.',
  keywords: [
    'Xevoras',
    'Luxury fashion India',
    'Column gown',
    'AI virtual try on',
    '3D avatar fashion studio',
    'Quiet luxury Mumbai',
    'Hatche Hamesha',
  ],
  authors: [{ name: 'XEVORAS Studio' }],
  openGraph: {
    title: 'XEVORAS — ALWAYS RARE | हटके हमेशा',
    description:
      'Modern everyday essentials and fluid festive eveningwear. Experience the next generation of fashion with 3D Avatar Customization and AI Virtual Try-On.',
    url: 'https://xevoras.com',
    siteName: 'XEVORAS',
    images: [
      {
        url: '/brand/xevoras-emblem-gold.jpg',
        width: 1200,
        height: 1200,
        alt: 'XEVORAS Luxury Gold Emblem',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'XEVORAS',
    url: 'https://xevoras.com',
    logo: 'https://xevoras.com/brand/logo.png',
    slogan: 'ALWAYS RARE · हटके हमेशा',
    description:
      'Luxury contemporary fashion label in India featuring elevated essentials, column gowns, weighted shirting, 3D digital avatar customization, and AI Virtual Try-On.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-obsidian text-ivory flex flex-col antialiased selection:bg-gold selection:text-obsidian">
        <BrandIntroModal />
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
