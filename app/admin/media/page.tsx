'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import Link from 'next/link';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async (searchQuery = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/media?search=${encodeURIComponent(searchQuery)}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (e) {
      console.error('Failed to load media assets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(search);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets(search);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let uploadedCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));

        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Failed to upload ${file.name}`);
        }
        uploadedCount++;
      }
      setSuccessMsg(`Successfully uploaded ${uploadedCount} image${uploadedCount > 1 ? 's' : ''}.`);
      await fetchAssets(search);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset? This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        setSuccessMsg('Asset deleted successfully');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to delete asset');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error deleting asset');
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AdminLayout activeHref="/admin/media">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#2A2A2A]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] tracking-[0.25em] text-[#B89560] uppercase font-semibold">
                ASSET REPOSITORY
              </span>
              <span className="text-[10px] bg-[#B89560]/10 text-[#B89560] px-2 py-0.5 rounded border border-[#B89560]/20 font-mono">
                {assets.length} ASSETS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#F5F1E8]">
              Media Library & Photography Vault
            </h1>
            <p className="text-xs text-[#B9ADA1] mt-1">
              Centralized high-resolution garment imagery, lookbook photography, and campaign assets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2.5 bg-[#B89560] hover:bg-[#A38250] text-[#101010] text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-[#101010]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload New Assets
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-200 rounded text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 rounded text-xs flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Upload Dropzone Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFileUpload(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-[#2A2A2A] hover:border-[#B89560]/60 rounded-xl p-8 text-center bg-[#161616]/60 transition-all cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center text-[#B89560] group-hover:scale-110 transition-transform mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#F5F1E8] mb-1">
            Drag and drop photography files here, or <span className="text-[#B89560] underline">browse</span>
          </p>
          <p className="text-[11px] text-[#B9ADA1]">
            Supports JPEG, PNG, WebP, AVIF up to 15MB each. High-definition luxury garment assets.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets by filename or tag..."
              className="w-full bg-[#161616] border border-[#2A2A2A] rounded px-4 py-2 text-xs text-[#F5F1E8] placeholder-[#B9ADA1]/50 focus:border-[#B89560] focus:outline-none pr-10"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B9ADA1] hover:text-[#B89560]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          <button
            onClick={() => {
              setSearch('');
              fetchAssets('');
            }}
            className="text-xs text-[#B9ADA1] hover:text-[#F5F1E8] px-3 py-2 border border-[#2A2A2A] rounded bg-[#161616]"
          >
            Refresh
          </button>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <svg className="w-8 h-8 animate-spin text-[#B89560] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-[#B9ADA1]">Loading media library...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="py-20 text-center border border-[#2A2A2A] rounded-xl bg-[#161616]/40">
            <p className="text-sm text-[#F5F1E8] font-medium mb-1">No media assets found</p>
            <p className="text-xs text-[#B9ADA1]">
              Upload garment photography or import products from Meesho to populate the vault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-[#161616] border border-[#2A2A2A] hover:border-[#B89560]/50 rounded-lg overflow-hidden transition-all duration-200 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-[#101010] overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                    <button
                      onClick={() => handleCopyUrl(asset.id, asset.url)}
                      className="px-2 py-1 bg-[#B89560] text-[#101010] text-[10px] font-semibold uppercase tracking-wider rounded"
                    >
                      {copiedId === asset.id ? 'Copied!' : 'Copy URL'}
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={deletingId === asset.id}
                      className="p-1 bg-rose-900/80 hover:bg-rose-700 text-white rounded"
                      title="Delete asset"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-2.5">
                  <p className="text-[11px] font-medium text-[#F5F1E8] truncate" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#B9ADA1] mt-1 font-mono">
                    <span>{formatSize(asset.sizeBytes)}</span>
                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
