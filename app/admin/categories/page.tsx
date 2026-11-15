'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Grid, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('women');
  const [description, setDescription] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender, description }),
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setDescription('');
        loadCategories();
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
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">TAXONOMY</span>
            <h1 className="font-editorial text-3xl font-bold text-ivory mt-1">Categories Directory</h1>
            <p className="text-xs text-stone mt-1">Organize clothing departments, gender lines, and storefront navigation.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 btn-gold rounded-lg text-xs font-bold uppercase tracking-wider shadow-gold"
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="p-5 rounded-xl bg-charcoal border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-gold/15 text-gold text-[10px] font-bold uppercase">
                  {c.gender}
                </span>
                <span className="text-xs text-stone">{c._count?.products || 0} Products</span>
              </div>
              <h3 className="font-editorial text-xl font-bold text-ivory">{c.name}</h3>
              <p className="text-xs text-stone/80 line-clamp-2">{c.description || 'Curated fashion department'}</p>
              <p className="text-[10px] text-stone/50 font-mono">Slug: {c.slug}</p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 rounded-2xl bg-charcoal border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-editorial text-lg font-bold text-ivory">Create Category</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-stone">✕</button>
              </div>
              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Silk Kaftans"
                    className="w-full bg-obsidian border border-white/10 rounded p-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 rounded p-2 text-ivory focus:outline-none focus:border-gold"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description for catalog filters"
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
