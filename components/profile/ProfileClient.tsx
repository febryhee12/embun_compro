'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  CheckCircle2,
  Camera,
  User,
  Phone,
  MapPin,
  Mail,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
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
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreFooter } from '@/components/explore/ExploreFooter';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import {
  AccountSidebar,
  AccountMobileNav,
  AccountLogoutDialog,
} from '@/components/account/AccountNav';

export function ProfileClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/explore');
    }
  };

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
    <div className="min-h-screen bg-[#fafafa] text-foreground flex flex-col justify-between">
      {/* ═══ HEADER ATAS (LOGO RESMI EMBUN EXPLORE & MENU AKUN, TANPA LOKASI) ═══ */}
      <ExploreHeader
        showSearch={false}
        showUserMenu={false}
        currentUser={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <Loader2 size={26} className="animate-spin text-brand-blue" />
            <p className="text-xs font-semibold">Memuat profil...</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 space-y-5 shadow-2xs max-w-md mx-auto my-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue/8 flex items-center justify-center p-3 border border-brand-blue/15 shadow-2xs">
              <img
                src="/images/logo/logogram_blue.svg"
                alt="Embun"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Masuk ke Akun Anda</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Anda harus masuk terlebih dahulu untuk melihat dan memperbarui profil Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all cursor-pointer"
            >
              <span>Masuk Sekarang</span>
            </button>
            <div>
              <Link
                href="/explore"
                className="text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                Ke Halaman Explore
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Judul Halaman */}
            <div className="border-b border-border/70 pb-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer shrink-0"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={22} className="stroke-[2.2]" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Profil Saya
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-foreground-muted mt-1 ml-9 sm:ml-10">
                Kelola data diri, kontak WhatsApp, dan preferensi akun Anda di Embun.
              </p>
            </div>

            {/* Navigasi Tab Horizontal (Mobile & Tablet) */}
            <AccountMobileNav
              activeTab="profile"
              onLogout={() => setShowLogoutConfirm(true)}
            />

            {/* Layout Grid Responsif (Sidebar di Desktop) */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
              {/* Sisi Kiri: Sidebar Menu Akun & Bantuan */}
              <AccountSidebar
                activeTab="profile"
                onLogout={() => setShowLogoutConfirm(true)}
              />

              {/* Sisi Kanan: Formulir Edit Profil */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-2xs space-y-8">
                  {/* Avatar + summary */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                    <div className="relative group shrink-0">
                      <div className="w-22 h-22 rounded-full bg-[#c2410c] text-white flex items-center justify-center font-bold text-2xl border-2 border-brand-lime shadow-xs overflow-hidden shrink-0">
                        {uploadingPhoto ? (
                          <Loader2 size={24} className="animate-spin text-white" />
                        ) : photoSrc ? (
                          <img
                            src={resolveAssetUrl(photoSrc)}
                            alt={profile?.fullName || 'Avatar'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-black text-white select-none">
                            {(profile?.fullName || 'Tamu')
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <label
                        htmlFor="profile-photo-input"
                        className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full shadow-md hover:bg-brand-blue-hover transition-all cursor-pointer border-2 border-white flex items-center justify-center"
                        title="Ubah Foto Profil"
                      >
                        <Camera size={14} />
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

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h2 className="font-bold text-lg text-foreground">
                          {profile?.fullName || 'Tamu Embun'}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <ShieldCheck size={12} />
                          <span>Akun Terverifikasi</span>
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                        <Mail size={12} className="text-brand-blue shrink-0" />
                        <span>{profile?.email || 'Belum ada email'}</span>
                      </p>
                      <p className="text-[11.5px] text-foreground-muted pt-1">
                        Foto dan data profil Anda akan ditampilkan kepada pengelola campsite untuk kelancaran verifikasi saat check-in.
                      </p>
                    </div>
                  </div>

                  {/* Edit form */}
                  <form onSubmit={handleSave} className="space-y-5 pt-4 border-t border-border/70">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                        Data Kontak Tamu
                      </h3>
                    </div>

                    {error && (
                      <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    {saved && (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>Profil berhasil disimpan.</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <User size={13} className="text-brand-blue" />
                        <span>Nama Lengkap</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nama lengkap Anda sesuai kartu identitas"
                        className="w-full px-4 py-3 rounded-2xl border border-border bg-surface/30 focus:bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                      />
                      <p className="text-[11px] text-foreground-muted">
                        Nama lengkap wajib diisi sesuai kartu identitas (KTP/SIM/Paspor).
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-600" />
                        <span>Nomor WhatsApp</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-foreground pointer-events-none select-none border-r border-border pr-2.5 py-1">
                          <span>🇮🇩</span>
                          <span>+62</span>
                        </div>
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
                          className="w-full pl-20 pr-4 py-3 rounded-2xl border border-border bg-surface/30 focus:bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-foreground-muted">
                        Nomor WhatsApp aktif untuk menerima voucher reservasi, e-tiket, & koordinasi check-in.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand-blue" />
                        <span>Alamat Domisili / Kota Asal</span>
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Contoh: Jl. Sukajadi No. 12, Kota Bandung, Jawa Barat"
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl border border-border bg-surface/30 focus:bg-white text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all resize-none"
                      />
                      <p className="text-[11px] text-foreground-muted">
                        Kota tempat tinggal Anda untuk keperluan data tamu registrasi.
                      </p>
                    </div>

                    <p className="text-[11px] text-foreground-muted bg-surface/50 p-3.5 rounded-2xl border border-border/70 leading-relaxed">
                      Alamat email ({profile?.email || '-'}) dikelola oleh penyedia autentikasi login Anda (Google/Apple) dan tidak dapat diubah secara langsung di sini.
                    </p>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving || uploadingPhoto}
                        className="w-full py-3.5 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-md hover:shadow-lg"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                        <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ FOOTER RESMI EXPLORE ═══ */}
      <ExploreFooter />

      {/* Logout Confirmation Dialog */}
      <AccountLogoutDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      {/* Guest Auth Modal */}
      <GuestAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={profile}
        onSuccess={(user) => {
          setProfile(user);
          setFullName(user.fullName || '');
          setPhone(user.phone || '');
          setAddress(user.address || '');
          setIsAuthOpen(false);
        }}
        onLogout={handleLogout}
      />
    </div>
  );
}
