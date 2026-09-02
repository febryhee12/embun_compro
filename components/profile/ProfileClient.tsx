'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Loader2,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import {
  getStoredGuestProfile,
  getGuestToken,
  clearGuestSession,
  fetchGuestProfile,
  updateGuestProfile,
  resolveAssetUrl,
  API_BASE_URL,
  ApiError,
} from '@/lib/api-client';

export function ProfileClient() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const stored = getStoredGuestProfile();
    if (stored) {
      setProfile(stored);
      setFullName(stored.fullName || '');
      setPhone(stored.phone || '');
      setAddress(stored.address || '');
    }

    if (!getGuestToken()) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const fresh = await fetchGuestProfile();
        setProfile(fresh);
        setFullName(fresh.fullName || '');
        setPhone(fresh.phone || '');
        setAddress(fresh.address || '');
        setError(null);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          clearGuestSession();
          setAuthRequired(true);
        } else if (!stored) {
          setError(err.message || 'Gagal memuat profil.');
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Format file harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5 MB.');
      return;
    }

    setUploadingPhoto(true);
    setError(null);
    try {
      const token = getGuestToken();
      if (!token) throw new Error('Anda harus masuk terlebih dahulu.');

      // 1. Dapatkan presigned upload URL
      const presignRes = await fetch(
        `${API_BASE_URL}/guest/me/photo-upload-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contentType: file.type,
            contentLength: file.size,
          }),
        },
      );
      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal menyiapkan unggahan foto.');
      }
      const { uploadUrl, photoKey } = await presignRes.json();

      // 2. Upload file langsung ke R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error('Gagal mengunggah foto ke penyimpanan.');
      }

      // 3. Simpan foto ke profil tamu
      const updated = await updateGuestProfile({ photoKey });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui foto profil.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateGuestProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        clearGuestSession();
        setAuthRequired(true);
      } else {
        setError(err.message || 'Gagal menyimpan profil.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearGuestSession();
    window.location.href = '/explore';
  };

  const photoSrc = profile?.photoUrl || profile?.avatarUrl;

  return (
    <div className="min-h-screen bg-white text-foreground">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-3">
          <Link
            href="/explore"
            className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} className="stroke-[2.2]" />
          </Link>
          <h1 className="font-bold text-sm text-foreground">Profil Saya</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-foreground-muted">
            <Loader2 size={24} className="animate-spin" />
            <p className="text-xs font-semibold">Memuat profil...</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border p-6 space-y-4">
            <p className="text-sm text-foreground-muted">
              Anda harus masuk terlebih dahulu untuk melihat profil.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all"
            >
              Ke Halaman Explore
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Avatar + summary */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-18 h-18 rounded-full bg-brand-lime/30 text-brand-blue flex items-center justify-center font-bold text-xl border-2 border-brand-lime shadow-xs overflow-hidden shrink-0">
                  {uploadingPhoto ? (
                    <Loader2 size={24} className="animate-spin text-brand-blue" />
                  ) : photoSrc ? (
                    <img
                      src={resolveAssetUrl(photoSrc)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <label
                  htmlFor="profile-photo-input"
                  className="absolute bottom-0 right-0 p-1.5 bg-brand-blue text-white rounded-full shadow-md hover:bg-brand-blue/90 transition-all cursor-pointer border-2 border-white flex items-center justify-center"
                  title="Ubah Foto Profil"
                >
                  <Camera size={13} />
                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    disabled={uploadingPhoto}
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>

              <div>
                <h2 className="font-bold text-base text-foreground">
                  {profile?.fullName || 'Tamu Embun'}
                </h2>
                <p className="text-xs text-foreground-muted">
                  {profile?.email || 'Belum ada email'}
                </p>
              </div>
            </div>

            <Link
              href="/orders"
              className="flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-surface/50 hover:bg-surface transition-colors"
            >
              <span className="text-sm font-semibold text-foreground">
                Pesanan Saya
              </span>
              <ArrowLeft
                size={16}
                className="rotate-180 text-foreground-muted"
              />
            </Link>

            {/* Edit form */}
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Edit Profil
              </h3>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}
              {saved && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Profil berhasil disimpan.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground-muted">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground-muted">
                  Nomor WhatsApp
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-bold text-foreground pointer-events-none select-none">
                    +62
                  </span>
                  <input
                    type="tel"
                    value={phone ? phone.replace(/^(\+62|62|0)/, '') : ''}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.startsWith('62')) val = val.slice(2);
                      while (val.startsWith('0')) val = val.slice(1);
                      setPhone(val ? `08${val.startsWith('8') ? val.slice(1) : val}` : '');
                    }}
                    placeholder="81234567890"
                    className="w-full pl-14 pr-4 py-3 rounded-2xl border border-border bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground-muted">
                  Alamat
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat Anda"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all resize-y"
                />
              </div>

              <p className="text-[11px] text-foreground-muted">
                Email ({profile?.email || '-'}) dikelola oleh penyedia login
                (Google/Apple) dan tidak dapat diubah di sini.
              </p>

              <button
                type="submit"
                disabled={saving || uploadingPhoto}
                className="w-full py-3.5 px-6 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-xs hover:shadow-md"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </form>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-3.5 px-6 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white text-foreground rounded-3xl shadow-2xl border border-border p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-foreground">
              Keluar dari Akun?
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun Anda saat ini?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-full border border-border bg-surface hover:bg-surface-variant text-foreground text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
