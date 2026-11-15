'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function AppInstallTrigger() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setInstalledSuccess(true);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // Check if on iOS
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIOS) {
        alert('On iPhone: Tap the Share button in Safari (box with arrow pointing up) -> Tap "Add to Home Screen"!');
      } else {
        alert('To install: Tap your mobile browser menu (3 dots) -> Tap "Install App" or "Add to Home screen"!');
      }
    }
  };

  if (isInstalled || installedSuccess) {
    return (
      <div className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2">
        <CheckCircle2 size={16} />
        <span>App Already Installed on this Device</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-gold transition-all active:scale-95"
    >
      <Download size={16} className="stroke-[2.5]" />
      <span>Install XEVORAS App Now (1-Click)</span>
    </button>
  );
}
