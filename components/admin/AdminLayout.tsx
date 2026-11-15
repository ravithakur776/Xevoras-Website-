'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Settings,
  Lock,
  LogOut,
  Sliders,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Link2,
  Grid,
  Sparkles,
  Layers,
  ClipboardList,
  Users,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
}

export function AdminLayout({ children, activeHref }: AdminLayoutProps) {
  const currentPath = usePathname();
  const pathname = activeHref || currentPath;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sessionEmail, setSessionEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated === true);
          if (data.user?.email) {
            setSessionEmail(data.user.email);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAuthenticated(true);
      setPasswordInput('');
    } catch (err: any) {
      setAuthError(err.message || 'Incorrect staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } finally {
      setIsAuthenticated(false);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-obsidian text-stone">
        <div className="flex items-center gap-2 text-xs">
          <RefreshCw size={16} className="animate-spin text-gold" />
          <span>Verifying Staff Credentials...</span>
        </div>
      </div>
    );
  }

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 bg-obsidian">
        <div className="w-full max-w-md p-8 rounded-xl bg-charcoal border border-white/10 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 mx-auto flex items-center justify-center text-gold">
            <Lock size={26} />
          </div>
          <div>
            <h1 className="font-editorial text-2xl font-bold text-ivory">XEVORAS Staff Console</h1>
            <p className="text-xs text-stone mt-1">Authorized operations and inventory control</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left font-sans text-xs">
            <div>
              <label className="block text-stone/80 mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter admin email..."
                className="w-full bg-obsidian border border-white/10 rounded px-3 py-2.5 text-ivory focus:outline-none focus:border-gold font-mono"
              />
            </div>
            <div>
              <label className="block text-stone/80 mb-1">Admin Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter your secret admin password..."
                className="w-full bg-obsidian border border-white/10 rounded px-3 py-2.5 text-ivory focus:outline-none focus:border-gold font-mono"
              />
            </div>
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-gold rounded text-xs uppercase tracking-widest font-bold shadow-gold mt-2 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
              <span>Verify Access</span>
            </button>
          </form>
          <p className="text-[10px] text-stone/50 font-sans">
            Protected via Server-Side Cryptographic HMAC Session Tokens
          </p>
        </div>
      </div>
    );
  }

  const catalogNav = [
    { label: 'Products & Dresses', href: '/admin/products', icon: ShoppingBag },
    { label: '+ Add Dress', href: '/admin/products/new/manual', icon: PlusCircle, badge: 'New' },
    { label: 'Meesho Import', href: '/admin/products/import/meesho', icon: Link2 },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  ];

  const storeNav = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Categories', href: '/admin/categories', icon: Grid },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-stone flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-obsidian border-r border-white/10 p-5 flex flex-col justify-between shrink-0 overflow-y-auto max-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="relative w-8 h-8">
              <Image src="/brand/logo.png" alt="XEVORAS" fill className="object-contain" />
            </div>
            <div>
              <p className="font-editorial text-base font-bold text-ivory leading-none">XEVORAS</p>
              <p className="text-[9px] text-gold tracking-widest uppercase mt-0.5">Control Centre</p>
            </div>
          </div>

          {/* Group 1: Catalogue & Products */}
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-[0.25em] text-stone/50 font-bold px-3">
              Catalogue Management
            </p>
            <nav className="space-y-1 font-sans">
              {catalogNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-gold/15 text-gold border border-gold/30 shadow-sm'
                        : 'text-stone hover:text-ivory hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold text-obsidian font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Store Operations */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <p className="text-[9px] uppercase tracking-[0.25em] text-stone/50 font-bold px-3">
              Store &amp; Orders
            </p>
            <nav className="space-y-1 font-sans">
              {storeNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-gold/15 text-gold border border-gold/30 shadow-sm'
                        : 'text-stone hover:text-ivory hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-3 text-xs">
          <div className="flex items-center justify-between text-[11px] text-stone/60">
            <span className="truncate max-w-[140px]" title={sessionEmail}>Admin: {sessionEmail || 'Super Admin'}</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
          <button
            type="button"
            onClick={handleSignout}
            className="flex items-center gap-2 text-stone hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={14} />
            <span>Lock Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
