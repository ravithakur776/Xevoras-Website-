'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Smartphone, Download, X, Share, PlusSquare, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already installed in standalone mode
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // 2. Check if iOS device
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isApple);

      // 3. Listen for Android/Chrome install prompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
        // Show banner after 2 seconds on mobile
        setTimeout(() => setShowBanner(true), 2000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      // Listen for app installed
      window.addEventListener('appinstalled', () => {
        setIsStandalone(true);
        setShowBanner(false);
        setShowModal(false);
        setInstallSuccess(true);
      });

      // Show banner on iOS if not in standalone
      if (isApple && !isStandaloneMode) {
        setTimeout(() => setShowBanner(true), 2500);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstallable(false);
          setShowBanner(false);
          setInstallSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      // Open luxury guide modal (for iOS or fallback)
      setShowModal(true);
    }
  };

  // If already running inside installed standalone app, don't show prompt
  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom App Install Bar (Mobile First) */}
      {showBanner && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="relative p-3.5 sm:p-4 rounded-2xl bg-charcoal/95 backdrop-blur-xl border border-gold/40 shadow-2xl flex items-center gap-3.5">
            {/* App Icon */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gold/50 shadow-gold bg-obsidian">
              <Image src="/icons/icon-192x192.png" alt="XEVORAS App" fill className="object-cover" />
            </div>

            {/* App Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-ivory tracking-wide truncate">XEVORAS App</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold font-bold">1-Click</span>
              </div>
              <p className="text-[11px] text-stone truncate">Always Rare &middot; Fast Checkout</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-gold hover:bg-gold-light text-obsidian text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-gold transition-all active:scale-95"
              >
                <Download size={13} className="shrink-0 stroke-[2.5]" />
                <span>Install</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="p-1.5 rounded-lg text-stone hover:text-ivory hover:bg-white/5 transition-colors"
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Install Modal for iOS & Direct Guidance */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-charcoal border border-gold/30 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-stone hover:text-ivory"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2">
              <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden border border-gold/40 shadow-gold bg-obsidian">
                <Image src="/brand/logo.png" alt="XEVORAS" fill className="object-cover" />
              </div>
              <h3 className="font-editorial text-2xl font-bold text-ivory">Install XEVORAS Atelier App</h3>
              <p className="text-xs text-stone">Experience ultra-fast loading, VIP drops, and 3D Avatar Try-On directly from your home screen.</p>
            </div>

            {isIOS ? (
              <div className="p-4 rounded-2xl bg-obsidian border border-white/10 space-y-3 text-xs text-stone">
                <div className="flex items-center gap-2 font-bold text-gold uppercase tracking-wider text-[11px]">
                  <span>How to install on iPhone / iPad:</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p>Tap the <Share size={14} className="inline text-gold mx-1" /> <strong>Share</strong> button in Safari's bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p>Scroll down and select <PlusSquare size={14} className="inline text-gold mx-1" /> <strong>"Add to Home Screen"</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <p>Tap <strong>"Add"</strong> on top-right. The XEVORAS icon will appear on your phone!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (deferredPrompt) {
                      await deferredPrompt.prompt();
                      setShowModal(false);
                    } else {
                      alert('In your mobile browser menu (3 dots on top right), tap "Add to Home Screen" or "Install App"!');
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-gold transition-all"
                >
                  <Download size={15} />
                  <span>Tap to Install on Phone</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-[11px] text-stone/70 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-400" /> Free & Secure
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-gold" /> Official Atelier App
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
