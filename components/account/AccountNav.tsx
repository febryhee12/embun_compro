'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Heart,
  ListOrdered,
  LogOut,
  ArrowRight,
  HelpCircle,
  MessageCircle,
  Mail,
} from 'lucide-react';

export type AccountTab = 'profile' | 'wishlist' | 'orders';

interface AccountSidebarProps {
  activeTab: AccountTab;
  onLogout: () => void;
  className?: string;
}

interface AccountMobileNavProps {
  activeTab: AccountTab;
  onLogout: () => void;
  className?: string;
}

interface AccountLogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AccountSidebar({ activeTab, onLogout, className = '' }: AccountSidebarProps) {
  return (
    <aside className={`hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24 self-start z-20 ${className}`}>
      <div className="space-y-5">
        {/* Kartu Menu Navigasi Akun */}
        <div className="bg-white rounded-3xl border border-border p-3.5 shadow-2xs">
          <div className="px-3 pt-2 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
              Pengaturan Akun
            </p>
          </div>

          <nav className="space-y-1.5">
            {/* 1. Informasi Pribadi */}
            {activeTab === 'profile' ? (
              <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold bg-brand-blue text-white shadow-xs select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <User size={16} className="text-white" />
                  <span className="truncate">Informasi Pribadi</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white">
                  Aktif
                </span>
              </div>
            ) : (
              <Link
                href="/profile"
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <User size={16} className="text-brand-blue" />
                  <span className="truncate">Informasi Pribadi</span>
                </div>
                <ArrowRight size={14} className="text-foreground-muted" />
              </Link>
            )}

            {/* 2. Wishlist Saya - icon warna biru clean */}
            {activeTab === 'wishlist' ? (
              <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold bg-brand-blue text-white shadow-xs select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Heart size={16} className="text-white" />
                  <span className="truncate">Wishlist Saya</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white">
                  Aktif
                </span>
              </div>
            ) : (
              <Link
                href="/wishlist"
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Heart size={16} className="text-brand-blue" />
                  <span className="truncate">Wishlist Saya</span>
                </div>
                <ArrowRight size={14} className="text-foreground-muted" />
              </Link>
            )}

            {/* 3. Pesanan Saya */}
            {activeTab === 'orders' ? (
              <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold bg-brand-blue text-white shadow-xs select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ListOrdered size={16} className="text-white" />
                  <span className="truncate">Pesanan Saya</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white">
                  Aktif
                </span>
              </div>
            ) : (
              <Link
                href="/orders"
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ListOrdered size={16} className="text-brand-blue" />
                  <span className="truncate">Pesanan Saya</span>
                </div>
                <ArrowRight size={14} className="text-foreground-muted" />
              </Link>
            )}

            {/* 4. Keluar dari Akun */}
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <LogOut size={16} />
                <span className="truncate">Keluar dari Akun</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Kartu Bantuan & Kontak Dukungan */}
        <div className="bg-white rounded-3xl border border-border p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <HelpCircle size={17} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Butuh Bantuan?</h4>
              <p className="text-[11px] text-foreground-muted">Layanan pelanggan Embun</p>
            </div>
          </div>
          <p className="text-[11.5px] text-foreground-muted leading-relaxed">
            Punya pertanyaan seputar akun, pemesanan penginapan, atau perubahan data kontak?
          </p>
          <div className="space-y-2 pt-1">
            <a
              href="https://wa.me/6282131411919?text=Halo%20Embun%20CS,%20saya%20butuh%20bantuan%20mengenai%20akun%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-emerald-500 hover:text-emerald-700 bg-surface/50 hover:bg-emerald-50/50 text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              <MessageCircle size={14} className="text-emerald-600" />
              <span>Chat WhatsApp CS</span>
            </a>
            <a
              href="mailto:support@embun.app"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-brand-blue hover:text-brand-blue bg-surface/50 hover:bg-brand-blue/5 text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              <Mail size={14} className="text-brand-blue" />
              <span>support@embun.app</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AccountMobileNav({ activeTab, onLogout, className = '' }: AccountMobileNavProps) {
  return (
    <div className={`lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:-mx-8 sm:px-8 ${className}`}>
      {/* 1. Edit Profil */}
      {activeTab === 'profile' ? (
        <span className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-brand-blue text-white border-brand-blue shadow-xs">
          <User size={14} />
          <span>Edit Profil</span>
        </span>
      ) : (
        <Link
          href="/profile"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-white text-foreground border-border hover:bg-surface transition-colors"
        >
          <User size={14} className="text-brand-blue" />
          <span>Edit Profil</span>
        </Link>
      )}

      {/* 2. Wishlist Saya - icon warna biru clean */}
      {activeTab === 'wishlist' ? (
        <span className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-brand-blue text-white border-brand-blue shadow-xs">
          <Heart size={14} />
          <span>Wishlist Saya</span>
        </span>
      ) : (
        <Link
          href="/wishlist"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-white text-foreground border-border hover:bg-surface transition-colors"
        >
          <Heart size={14} className="text-brand-blue" />
          <span>Wishlist Saya</span>
        </Link>
      )}

      {/* 3. Pesanan Saya */}
      {activeTab === 'orders' ? (
        <span className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-brand-blue text-white border-brand-blue shadow-xs">
          <ListOrdered size={14} />
          <span>Pesanan Saya</span>
        </span>
      ) : (
        <Link
          href="/orders"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-white text-foreground border-border hover:bg-surface transition-colors"
        >
          <ListOrdered size={14} className="text-brand-blue" />
          <span>Pesanan Saya</span>
        </Link>
      )}

      {/* 4. Keluar */}
      <button
        type="button"
        onClick={onLogout}
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-white text-red-600 border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
      >
        <LogOut size={14} />
        <span>Keluar</span>
      </button>
    </div>
  );
}

export function AccountLogoutDialog({ isOpen, onClose, onConfirm }: AccountLogoutDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white text-foreground rounded-3xl shadow-2xl border border-border p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <h3 className="font-bold text-lg text-foreground">Keluar dari Akun?</h3>
        <p className="text-xs text-foreground-muted leading-relaxed">
          Apakah Anda yakin ingin keluar dari akun Anda saat ini?
        </p>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-full border border-border bg-surface hover:bg-surface-variant text-foreground text-xs font-bold transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
