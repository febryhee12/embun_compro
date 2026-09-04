'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { updateGuestProfile, setGuestSession, getGuestToken } from '@/lib/api-client';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any | null;
  onSuccess?: (updatedUser: any) => void;
}

export function CompleteProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}: CompleteProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phone ? currentUser.phone.replace(/^(\+62|62|0)/, '') : '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const rawPhoneDigits = phone.replace(/\D/g, '');
    const cleanAddress = address.trim();

    if (!cleanName) {
      setError('Nama lengkap wajib diisi sesuai kartu identitas.');
      return;
    }

    if (!rawPhoneDigits) {
      setError('Nomor WhatsApp wajib diisi.');
      return;
    }

    if (rawPhoneDigits.length < 8 || rawPhoneDigits.length > 14) {
      setError('Nomor WhatsApp tidak valid. Masukkan 8–14 digit angka.');
      return;
    }

    if (!cleanAddress) {
      setError('Alamat domisili atau kota asal wajib diisi.');
      return;
    }

    // Format phone to standard Indonesian national format (08...)
    let formattedPhone = rawPhoneDigits;
    if (formattedPhone.startsWith('62')) {
      formattedPhone = formattedPhone.slice(2);
    }
    while (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.slice(1);
    }
    formattedPhone = `08${formattedPhone.startsWith('8') ? formattedPhone.slice(1) : formattedPhone}`;

    setLoading(true);
    try {
      const updated = await updateGuestProfile({
        fullName: cleanName,
        phone: formattedPhone,
        address: cleanAddress,
      });

      const token = getGuestToken();
      if (token) {
        setGuestSession(token, updated);
      }

      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan kelengkapan profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-end pb-1">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 -mt-1 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Introduction */}
        <div className="pb-4 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Lengkapi Profil Anda
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
            Data ini diperlukan oleh pengelola campsite untuk mengonfirmasi reservasi dan memandu proses check-in Anda.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              required
              className="w-full px-4 py-3 rounded-2xl border border-border bg-surface/30 focus:bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
            />
          </div>

          {/* WhatsApp Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Nomor WhatsApp / HP
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-foreground pointer-events-none select-none border-r border-border pr-2.5 py-1">
                <span>🇮🇩</span>
                <span>+62</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.startsWith('62')) val = val.slice(2);
                  while (val.startsWith('0')) val = val.slice(1);
                  setPhone(val);
                }}
                placeholder="81234567890"
                required
                className="w-full pl-20 pr-4 py-3 rounded-2xl border border-border bg-surface/30 focus:bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all font-mono"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Alamat / Kota Asal
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Sukajadi No. 12, Kota Bandung"
              rows={2}
              required
              className="w-full px-4 py-3 rounded-2xl border border-border bg-surface/30 focus:bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>{loading ? 'Menyimpan Profil...' : 'Simpan & Lanjutkan'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2.5 text-center text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
