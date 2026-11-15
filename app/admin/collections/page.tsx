'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setDescription('');
        loadCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">EDITORIAL CURATION</span>
            <h1 className="font-editorial text-3xl font-bold text-ivory mt-1">Curated Collections</h1>
            <p className="text-xs text-stone mt-1">Create seasonal lookbook edits (e.g. Silk &amp; Satin, Minimalist Monochromes).</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 btn-gold rounded-lg text-xs font-bold uppercase tracking-wider shadow-gold"
          >
            <Plus size={14} />
            <span>New Collection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.length === 0 ? (
            <div className="sm:col-span-3 p-8 rounded-xl bg-charcoal border border-white/5 text-center text-stone">
              <p className="font-editorial text-lg font-bold text-ivory">No collections created yet.</p>
              <p className="text-xs mt-1">Create your first editorial collection edit.</p>
            </div>
          ) : (
            collections.map((col) => (
              <div key={col.id} className="p-5 rounded-xl bg-charcoal border border-white/10 space-y-3">
                <span className="text-[10px] uppercase font-bold text-gold">Curated Edit</span>
                <h3 className="font-editorial text-xl font-bold text-ivory">{col.name}</h3>
                <p className="text-xs text-stone/80 line-clamp-2">{col.description || 'Editorial collection edit'}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-stone">
                  <span>{col._count?.products || 0} Pieces Attached</span>
                  <span className="font-mono">{col.slug}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 rounded-2xl bg-charcoal border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-editorial text-lg font-bold text-ivory">Create Collection</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-stone">✕</button>
              </div>
              <form onSubmit={handleCreateCollection} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Collection Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Silk &amp; Satin Edit"
                    className="w-full bg-obsidian border border-white/10 rounded p-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Editorial Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Curated high-sheen eveningwear pieces"
                    className="w-full bg-obsidian border border-white/10 rounded p-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-obsidian rounded text-stone">Cancel</button>
                  <button type="submit" className="px-4 py-2 btn-gold rounded text-xs font-bold uppercase">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
