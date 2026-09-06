'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Heart,
  ListOrdered,
  ArrowRight,
  HelpCircle,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { ACCOUNT_I18N, type Language } from '@/lib/account-i18n';

export type AccountTab = 'profile' | 'wishlist' | 'orders';

interface AccountSidebarProps {
  activeTab: AccountTab;
  onLogout?: () => void;
  className?: string;
  lang?: Language;
}

interface AccountMobileNavProps {
  activeTab: AccountTab;
  onLogout?: () => void;
  className?: string;
  lang?: Language;
}

interface AccountLogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang?: Language;
}

export function AccountSidebar({ activeTab, onLogout, className = '', lang = 'id' }: AccountSidebarProps) {
  const t = ACCOUNT_I18N[lang].nav;
  return (
    <aside className={`hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24 self-start z-20 ${className}`}>
      <div className="space-y-5">
        {/* Kartu Menu Navigasi Akun */}
        <div className="bg-white dark:bg-surface rounded-3xl border border-border p-3.5 shadow-2xs">
          <div className="px-3 pt-2 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
              {t.accountSettings}
            </p>
          </div>

          <nav className="space-y-1.5">
            {/* 1. Informasi Pribadi */}
            {activeTab === 'profile' ? (
              <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold bg-brand-blue dark:bg-brand-lime text-white dark:text-black shadow-xs select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <User size={16} className="text-white dark:text-black" />
                  <span className="truncate">{t.profile}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white dark:bg-black/15 dark:text-black">
                  {t.active}
                </span>
              </div>
            ) : (
              <Link
                href="/profile"
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <User size={16} className="text-brand-blue dark:text-brand-lime" />
                  <span className="truncate">{t.profile}</span>
                </div>
                <ArrowRight size={14} className="text-foreground-muted" />
              </Link>
            )}

            {/* 2. Wishlist Saya */}
            {activeTab === 'wishlist' ? (
              <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold bg-brand-blue dark:bg-brand-lime text-white dark:text-black shadow-xs select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Heart size={16} className="text-white dark:text-black" />
                  <span className="truncate">{t.wishlist}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white dark:bg-black/15 dark:text-black">
                  {t.active}
                </span>
              </div>
            ) : (
              <Link
                href="/wishlist"
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Heart size={16} className="text-brand-blue dark:text-brand-lime" />
                  <span className="truncate">{t.wishlist}</span>
                </div>
                <ArrowRight size={14} className="text-foreground-muted" />
              </Link>
            )}

            {/* 3. Pesanan Saya */}
            {activeTab === 'orders' ? (
              <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold bg-brand-blue dark:bg-brand-lime text-white dark:text-black shadow-xs select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ListOrdered size={16} className="text-white dark:text-black" />
                  <span className="truncate">{t.orders}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white dark:bg-black/15 dark:text-black">
                  {t.active}
                </span>
              </div>
            ) : (
              <Link
                href="/orders"
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:text-foreground hover:bg-surface transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ListOrdered size={16} className="text-brand-blue dark:text-brand-lime" />
                  <span className="truncate">{t.orders}</span>
                </div>
                <ArrowRight size={14} className="text-foreground-muted" />
              </Link>
            )}
          </nav>
        </div>

        {/* Kartu Bantuan & Kontak Dukungan */}
        <div className="bg-white dark:bg-surface rounded-3xl border border-border p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-lime/15 text-brand-blue dark:text-brand-lime flex items-center justify-center shrink-0">
              <HelpCircle size={17} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">{t.needHelp}</h4>
              <p className="text-[11px] text-foreground-muted">{t.customerService}</p>
            </div>
          </div>
          <p className="text-[11.5px] text-foreground-muted leading-relaxed">
            {t.helpDesc}
          </p>
          <div className="space-y-2 pt-1">
            <a
              href="https://wa.me/6282131411919?text=Halo%20Embun%20CS,%20saya%20butuh%20bantuan%20mengenai%20akun%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-emerald-500 hover:text-emerald-500 bg-surface/50 hover:bg-emerald-50/10 text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              <MessageCircle size={14} className="text-emerald-500" />
              <span>{t.chatCs}</span>
            </a>
            <a
              href="mailto:support@embun.app"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime bg-surface/50 hover:bg-brand-blue/5 dark:hover:bg-brand-lime/10 text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              <Mail size={14} className="text-brand-blue dark:text-brand-lime" />
              <span>support@embun.app</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AccountMobileNav({ activeTab, onLogout, className = '', lang = 'id' }: AccountMobileNavProps) {
  const t = ACCOUNT_I18N[lang].nav;
  return (
    <div className={`lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:-mx-8 sm:px-8 ${className}`}>
      {/* 1. Edit Profil */}
      {activeTab === 'profile' ? (
        <span className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-brand-blue dark:bg-brand-lime text-white dark:text-black border-brand-blue dark:border-brand-lime shadow-xs">
          <User size={14} />
          <span>{t.editProfile}</span>
        </span>
      ) : (
        <Link
          href="/profile"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-white dark:bg-surface text-foreground border-border hover:bg-surface transition-colors"
        >
          <User size={14} className="text-brand-blue dark:text-brand-lime" />
          <span>{t.editProfile}</span>
        </Link>
      )}

      {/* 2. Wishlist Saya */}
      {activeTab === 'wishlist' ? (
        <span className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-brand-blue dark:bg-brand-lime text-white dark:text-black border-brand-blue dark:border-brand-lime shadow-xs">
          <Heart size={14} />
          <span>{t.wishlist}</span>
        </span>
      ) : (
        <Link
          href="/wishlist"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-white dark:bg-surface text-foreground border-border hover:bg-surface transition-colors"
        >
          <Heart size={14} className="text-brand-blue dark:text-brand-lime" />
          <span>{t.wishlist}</span>
        </Link>
      )}

      {/* 3. Pesanan Saya */}
      {activeTab === 'orders' ? (
        <span className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-brand-blue dark:bg-brand-lime text-white dark:text-black border-brand-blue dark:border-brand-lime shadow-xs">
          <ListOrdered size={14} />
          <span>{t.orders}</span>
        </span>
      ) : (
        <Link
          href="/orders"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border bg-white dark:bg-surface text-foreground border-border hover:bg-surface transition-colors"
        >
          <ListOrdered size={14} className="text-brand-blue dark:text-brand-lime" />
          <span>{t.orders}</span>
        </Link>
      )}
    </div>
  );
}

export function AccountLogoutDialog({ isOpen, onClose, onConfirm, lang = 'id' }: AccountLogoutDialogProps) {
  const t = ACCOUNT_I18N[lang].nav;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-surface text-foreground rounded-3xl shadow-2xl border border-border p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <h3 className="font-bold text-lg text-foreground">{t.logoutDialogTitle}</h3>
        <p className="text-xs text-foreground-muted leading-relaxed">
          {t.logoutDialogDesc}
        </p>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-full border border-border bg-surface hover:bg-surface-variant text-foreground text-xs font-bold transition-all cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
