'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X, Sparkles, Box, Download } from 'lucide-react';
import { useCart } from '@/lib/store/cartContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { SearchModal } from './SearchModal';

export function Navbar() {
  const pathname = usePathname();
  const { openCart, itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'women' | 'men' | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMegaMenu(null);
  }, [pathname]);

  const navLinks = [
    { label: 'Women', href: '/women' },
    { label: 'Men', href: '/men' },
    { label: 'New In', href: '/shop?sort=newest' },
    { label: 'The Edit', href: '/shop?featured=true' },
    {
      label: 'Avatar Studio',
      href: '/avatar-studio',
      badge: '3D',
      icon: Box,
    },
    {
      label: 'Virtual Try-On',
      href: '/virtual-try-on',
      badge: 'AI',
      icon: Sparkles,
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-obsidian/95 backdrop-blur-md border-b border-white/10 shadow-luxury py-3'
            : 'bg-obsidian border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile hamburger & desktop main nav */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone hover:text-ivory focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Brand Wordmark & Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/brand/logo.png"
                  alt="XEVORAS"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-lg sm:text-xl font-bold tracking-widest text-ivory group-hover:text-gold transition-colors leading-none">
                  XEVORAS
                </span>
                <span className="text-[9px] tracking-[0.25em] text-gold uppercase mt-0.5">
                  ALWAYS RARE
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center space-x-8"
            aria-label="Main Navigation"
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href.includes('?') && pathname.startsWith(link.href.split('?')[0]));
              const isWomen = link.href === '/women';
              const isMen = link.href === '/men';

              return (
                <div
                  key={link.label}
                  className="relative py-1"
                  onMouseEnter={() => {
                    if (isWomen) setActiveMegaMenu('women');
                    else if (isMen) setActiveMegaMenu('men');
                    else setActiveMegaMenu(null);
                  }}
                >
                  <Link
                    href={link.href}
                    className={`text-sm tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 ${
                      isActive ? 'text-gold font-medium' : 'text-stone hover:text-ivory'
                    }`}
                  >
                    {link.icon && <link.icon size={13} className="text-gold" />}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 font-sans font-semibold tracking-normal uppercase bg-gold/15 text-gold border border-gold/30 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-stone hover:text-gold transition-colors"
              aria-label="Search collection"
            >
              <Search size={20} />
            </button>

            <Link
              href="/wishlist"
              className="p-2 text-stone hover:text-gold transition-colors relative"
              aria-label="View Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-obsidian text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              className="p-2 text-stone hover:text-gold transition-colors hidden sm:block"
              aria-label="My Account"
            >
              <User size={20} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="p-2 text-stone hover:text-gold transition-colors relative group"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={20} className="group-hover:scale-105 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-obsidian text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Editorial Mega Menu Dropdown */}
        {activeMegaMenu && (
          <div
            onMouseEnter={() => {}}
            onMouseLeave={() => setActiveMegaMenu(null)}
            className="hidden lg:block border-t border-white/10 bg-obsidian/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 mt-2"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeMegaMenu === 'women' ? (
                <div className="grid grid-cols-12 gap-8 items-start">
                  <div className="col-span-3 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                      Signature Silhouettes
                    </p>
                    <ul className="space-y-2 text-xs font-sans text-stone">
                      <li>
                        <Link href="/shop?category=women-dresses" className="hover:text-gold transition-colors block">
                          Column Gowns &amp; Eveningwear
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=women-outerwear" className="hover:text-gold transition-colors block">
                          Linen &amp; Wool Trench Coats
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=women-co-ords" className="hover:text-gold transition-colors block">
                          Architectural Co-ords &amp; Sets
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=women-trousers" className="hover:text-gold transition-colors block">
                          Tailored High-Waist Trousers
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-3 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                      Curated Edits
                    </p>
                    <ul className="space-y-2 text-xs font-sans text-stone">
                      <li>
                        <Link href="/shop?sort=newest" className="hover:text-gold transition-colors block">
                          Autumn/Winter 2026 Arrivals
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?featured=true" className="hover:text-gold transition-colors block">
                          The Editorial Capsule
                        </Link>
                      </li>
                      <li>
                        <Link href="/size-guide" className="hover:text-gold transition-colors block">
                          Atelier Measurement Guide
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-3 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                      Digital Fashion Tech
                    </p>
                    <ul className="space-y-2 text-xs font-sans text-stone">
                      <li>
                        <Link href="/avatar-studio" className="hover:text-gold transition-colors flex items-center gap-1.5">
                          <Box size={13} className="text-gold" />
                          <span>3D Avatar Fitting Studio</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/virtual-try-on" className="hover:text-gold transition-colors flex items-center gap-1.5">
                          <Sparkles size={13} className="text-gold" />
                          <span>AI Photo Virtual Try-On</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-3">
                    <Link
                      href="/women"
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 block shadow-lg"
                    >
                      <Image
                        src="/media/editorial/women-story.jpg"
                        alt="Women's Collection"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                          FESTIVE &amp; CONTEMPORARY
                        </span>
                        <p className="font-editorial text-sm font-bold text-ivory">Women’s 2026 Collection</p>
                      </div>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-8 items-start">
                  <div className="col-span-3 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                      Signature Silhouettes
                    </p>
                    <ul className="space-y-2 text-xs font-sans text-stone">
                      <li>
                        <Link href="/shop?category=men-shirts" className="hover:text-gold transition-colors block">
                          Weighted Oxford Shirts
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=men-jeans" className="hover:text-gold transition-colors block">
                          Selvedge Rigid Straight Denim
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=men-outerwear" className="hover:text-gold transition-colors block">
                          Archival Wool Trench Coats
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=men-tshirts" className="hover:text-gold transition-colors block">
                          High-GSM Foundation Tees
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?category=men-sweatshirts" className="hover:text-gold transition-colors block">
                          Loopback Heavyweight Fleece
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-3 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                      Curated Edits
                    </p>
                    <ul className="space-y-2 text-xs font-sans text-stone">
                      <li>
                        <Link href="/shop?sort=newest" className="hover:text-gold transition-colors block">
                          Autumn/Winter 2026 Arrivals
                        </Link>
                      </li>
                      <li>
                        <Link href="/shop?featured=true" className="hover:text-gold transition-colors block">
                          Considered Essentials
                        </Link>
                      </li>
                      <li>
                        <Link href="/size-guide" className="hover:text-gold transition-colors block">
                          Tailored Fit Specifications
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-3 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                      Digital Fashion Tech
                    </p>
                    <ul className="space-y-2 text-xs font-sans text-stone">
                      <li>
                        <Link href="/avatar-studio" className="hover:text-gold transition-colors flex items-center gap-1.5">
                          <Box size={13} className="text-gold" />
                          <span>3D Avatar Fitting Studio</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/virtual-try-on" className="hover:text-gold transition-colors flex items-center gap-1.5">
                          <Sparkles size={13} className="text-gold" />
                          <span>AI Photo Virtual Try-On</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-3">
                    <Link
                      href="/men"
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 block shadow-lg"
                    >
                      <Image
                        src="/media/editorial/men-story.jpg"
                        alt="Men's Collection"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                          STRUCTURED &amp; RELAXED
                        </span>
                        <p className="font-editorial text-sm font-bold text-ivory">Men’s 2026 Collection</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-charcoal border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2.5">
                  <Image src="/brand/logo.png" alt="XEVORAS" width={32} height={32} />
                  <span className="font-editorial text-lg font-bold text-ivory tracking-widest">
                    XEVORAS
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone hover:text-ivory"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-base font-medium tracking-wide text-ivory/90 hover:text-gold py-2 border-b border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      {link.icon && <link.icon size={16} className="text-gold" />}
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] px-2 py-0.5 bg-gold/20 text-gold border border-gold/40 rounded-full font-sans font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}

                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-base font-bold tracking-wide text-gold py-2.5 px-3 rounded-xl bg-gold/10 border border-gold/30 mt-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Download size={18} className="text-gold" />
                    <span>Download App</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-gold text-obsidian rounded-full font-sans font-bold">
                    1-Click
                  </span>
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3 text-xs text-stone">
              <Link href="/account" className="flex items-center gap-2 hover:text-ivory py-1">
                <User size={15} />
                <span>Customer Account & Orders</span>
              </Link>
              <Link href="/admin" className="block text-stone/60 hover:text-gold py-1">
                Store Staff Admin Console
              </Link>
              <p className="text-[11px] text-stone/40 pt-2 font-hindi">
                हटके हमेशा · Designed for the refined life
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
