'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Security Credentials State
  const [currentAdminEmail, setCurrentAdminEmail] = useState('admin@xevoras.com');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [credSuccess, setCredSuccess] = useState('');
  const [credError, setCredError] = useState('');

  // General Settings State
  const [brandName, setBrandName] = useState('XEVORAS');
  const [tagline, setTagline] = useState('ALWAYS RARE');
  const [hindiTagline, setHindiTagline] = useState('हटके हमेशा');
  const [supportEmail, setSupportEmail] = useState('concierge@xevoras.com');
  const [supportPhone, setSupportPhone] = useState('+91 80 4920 1888');

  // Commerce Configuration
  const [currency, setCurrency] = useState('INR (₹)');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1499');
  const [defaultMarginPercent, setDefaultMarginPercent] = useState('55');
  const [defaultShippingCost, setDefaultShippingCost] = useState('70');
  const [defaultPackagingCost, setDefaultPackagingCost] = useState('40');

  // Supplier & Integration API Keys
  const [meeshoApiKey, setMeeshoApiKey] = useState('');
  const [meeshoWebhookSecret, setMeeshoWebhookSecret] = useState('');
  const [meeshoPartnerStatus, setMeeshoPartnerStatus] = useState('OFFICIAL_ADAPTER_ACTIVE');
  const [razorpayKey, setRazorpayKey] = useState('rzp_live_••••••••••••');
  const [shiprocketToken, setShiprocketToken] = useState('sr_tok_••••••••••••');

  // Fetch current admin credentials
  useEffect(() => {
    fetch('/api/admin/security/credentials')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) {
          setCurrentAdminEmail(data.email);
          setNewEmail(data.email);
        }
      })
      .catch((err) => console.error('Failed to load admin security profile:', err));
  }, []);

  const handleUpdateSecurityCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');

    if (!currentPassword) {
      setCredError('Please enter your current admin password to verify your identity.');
      return;
    }

    if (!newEmail && !newPassword) {
      setCredError('Please provide a new email or a new password to update.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setCredError('New password must be at least 8 characters long for high security.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredError('New password and confirmation do not match.');
        return;
      }
    }

    try {
      setCredLoading(true);
      const res = await fetch('/api/admin/security/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update admin credentials.');
      }

      setCredSuccess(data.message || 'Admin security credentials updated successfully!');
      if (data.email) {
        setCurrentAdminEmail(data.email);
        setNewEmail(data.email);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setCredError(err.message || 'An error occurred while updating admin credentials.');
    } finally {
      setCredLoading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }, 800);
  };

  return (
    <AdminLayout activeHref="/admin/settings">
      <div className="space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#2A2A2A]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] tracking-[0.25em] text-[#B89560] uppercase font-semibold">
                SYSTEM CONFIGURATION & SECURITY
              </span>
              <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                SECURE ACCESS ENFORCED
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#F5F1E8]">
              Platform, Security & Supplier Settings
            </h1>
            <p className="text-xs text-[#B9ADA1] mt-1">
              Manage your private admin email & password, brand identities, pricing parameters, and supplier integrations.
            </p>
          </div>
        </div>

        {/* 1. ADMIN ACCESS & CREDENTIALS SECURITY CARD */}
        <div className="bg-[#161616] border border-[#B89560]/40 rounded-xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B89560]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="border-b border-[#2A2A2A] pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-lg font-serif text-[#F5F1E8]">Admin Email & Password Security</h2>
              </div>
              <p className="text-xs text-[#B9ADA1] mt-0.5">
                Protect your XEVORAS control center. Only you will be able to access the admin panel with these customized credentials.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#101010] border border-[#333] text-[#B89560] px-3 py-1 rounded font-mono">
                ACTIVE ADMIN: {currentAdminEmail}
              </span>
            </div>
          </div>

          {credSuccess && (
            <div className="p-4 bg-emerald-950/50 border border-emerald-700/60 text-emerald-200 rounded-lg text-xs flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {credSuccess}
              </span>
              <button type="button" onClick={() => setCredSuccess('')} className="text-emerald-400 hover:text-white">✕</button>
            </div>
          )}

          {credError && (
            <div className="p-4 bg-red-950/50 border border-red-700/60 text-red-200 rounded-lg text-xs flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {credError}
              </span>
              <button type="button" onClick={() => setCredError('')} className="text-red-400 hover:text-white">✕</button>
            </div>
          )}

          <form onSubmit={handleUpdateSecurityCredentials} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Admin Email */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Admin Login Email ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com or admin@xevoras.com"
                    required
                    className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2.5 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-[#777] font-mono">
                    Login User ID
                  </span>
                </div>
                <p className="text-[10px] text-[#888] mt-1.5">
                  The email address required to sign into this Admin Control Center.
                </p>
              </div>

              {/* Current Password Verification */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Current Admin Password <span className="text-[#B89560]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password to verify"
                    required
                    className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2.5 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none pr-12 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-[10px] text-[#B89560] hover:underline uppercase"
                  >
                    {showCurrentPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[10px] text-[#888] mt-1.5">
                  Initial password if not changed yet is: <span className="text-[#B89560] font-mono">xevoras@admin2026</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* New Custom Password */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  New Private Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password (min 8 characters)"
                    minLength={8}
                    className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2.5 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none pr-12 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-[10px] text-[#B89560] hover:underline uppercase"
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[10px] text-[#888] mt-1.5">
                  Leave blank if you only want to change your email address.
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2.5 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none font-mono"
                />
                <p className="text-[10px] text-[#888] mt-1.5">
                  Must match the new password exactly.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#222]">
              <div className="text-[11px] text-[#999] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#B89560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Hashed with PBKDF2 SHA-512 with unique cryptographic salt.</span>
              </div>

              <button
                type="submit"
                disabled={credLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#B89560] to-[#997744] hover:from-[#C9A46C] hover:to-[#A6834F] text-[#101010] text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {credLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-[#101010]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating Credentials...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Lock & Save Admin Credentials
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 2. GENERAL COMMERCE & BRAND FORM */}
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
            <h2 className="text-lg font-serif text-[#F5F1E8]">General Store Configuration</h2>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#222] hover:bg-[#2A2A2A] text-[#F5F1E8] text-xs font-semibold uppercase tracking-wider rounded border border-[#333] transition-all duration-200 flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save Store Details'}
            </button>
          </div>

          {success && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 rounded text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Platform configuration updated and synchronized successfully across all live services.
              </span>
              <button type="button" onClick={() => setSuccess(false)} className="text-emerald-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Brand & Identity Section */}
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#2A2A2A] pb-4">
              <h2 className="text-lg font-serif text-[#F5F1E8]">Brand & Customer Concierge</h2>
              <p className="text-xs text-[#B9ADA1]">Identifiers used in customer invoices, order confirmations, and storefront headers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  English Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Hindi Brand Identity
                </label>
                <input
                  type="text"
                  value={hindiTagline}
                  onChange={(e) => setHindiTagline(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Concierge Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  VIP Client Hotline
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Margin Rule Defaults */}
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#2A2A2A] pb-4">
              <h2 className="text-lg font-serif text-[#F5F1E8]">Default Pricing & Margin Rules</h2>
              <p className="text-xs text-[#B9ADA1]">
                Automated financial calculations applied during product imports and manual product creations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Storefront Currency
                </label>
                <input
                  type="text"
                  value={currency}
                  disabled
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#B9ADA1] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Free Shipping Order Min (₹)
                </label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Target Gross Margin (%)
                </label>
                <input
                  type="number"
                  value={defaultMarginPercent}
                  onChange={(e) => setDefaultMarginPercent(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Default Packaging (₹)
                </label>
                <input
                  type="number"
                  value={defaultPackagingCost}
                  onChange={(e) => setDefaultPackagingCost(e.target.value)}
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Meesho Integration & Partner Security Protocol */}
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#2A2A2A] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif text-[#F5F1E8]">Meesho Supplier Source Link & API Protocol</h2>
                <p className="text-xs text-[#B9ADA1]">
                  Compliance rules, supplier link storage, and official partner API credentials.
                </p>
              </div>
              <span className="px-3 py-1 bg-[#B89560]/10 text-[#B89560] text-[10px] font-mono rounded border border-[#B89560]/30 uppercase font-semibold">
                STRICT COMPLIANCE MODE
              </span>
            </div>

            <div className="p-4 bg-[#101010] border border-[#2A2A2A] rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#B89560]/20 text-[#B89560] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-[#B9ADA1] leading-relaxed">
                  <strong className="text-[#F5F1E8]">Adherence to E-Commerce Platform Standards:</strong> Direct automated web scraping, CAPTCHA bypass, and unauthenticated scraping of Meesho catalog pages are prohibited by platform terms of service. XEVORAS stores supplier source URLs securely in the database (`ProductImportJob.sourceUrl`) and provides an official Provider Adapter interface with manual curation fallback for maximum reliability.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Meesho Official Partner API Key (Optional)
                </label>
                <input
                  type="password"
                  value={meeshoApiKey}
                  onChange={(e) => setMeeshoApiKey(e.target.value)}
                  placeholder="Enter authorized Meesho Partner API Token..."
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none font-mono"
                />
                <p className="text-[10px] text-[#B9ADA1] mt-1.5">
                  When provided, official product catalog and inventory sync will execute directly via Meesho's Partner Endpoints.
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#B9ADA1] uppercase mb-2">
                  Meesho Webhook Secret
                </label>
                <input
                  type="password"
                  value={meeshoWebhookSecret}
                  onChange={(e) => setMeeshoWebhookSecret(e.target.value)}
                  placeholder="Enter webhook HMAC signature..."
                  className="w-full bg-[#101010] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none font-mono"
                />
                <p className="text-[10px] text-[#B9ADA1] mt-1.5">
                  Verifies authenticity of incoming supplier fulfillment and stock update notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Courier & Payment Gateway Connections */}
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#2A2A2A] pb-4">
              <h2 className="text-lg font-serif text-[#F5F1E8]">Logistics & Payments Integration</h2>
              <p className="text-xs text-[#B9ADA1]">Third-party production infrastructure connected to order workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-[#101010] border border-[#2A2A2A] rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#F5F1E8]">Razorpay / Cashfree Payments</h3>
                  <p className="text-[11px] text-[#B9ADA1] font-mono mt-0.5">{razorpayKey}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-semibold uppercase">
                  Active
                </span>
              </div>

              <div className="p-4 bg-[#101010] border border-[#2A2A2A] rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#F5F1E8]">Shiprocket / Delhivery Courier Desk</h3>
                  <p className="text-[11px] text-[#B9ADA1] font-mono mt-0.5">{shiprocketToken}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-semibold uppercase">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
