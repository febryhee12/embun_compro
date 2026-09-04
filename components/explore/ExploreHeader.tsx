'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, Menu, MapPin, Calendar, X, Check, Heart } from 'lucide-react';
import { resolveAssetUrl } from '@/lib/api-client';

interface ExploreHeaderProps {
  onOpenAuth: () => void;
  currentUser: any | null;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  availableCities?: string[];
}

export function ExploreHeader({
  onOpenAuth,
  currentUser,
  showSearch = true,
  searchQuery = '',
  onSearchChange = () => {},
  selectedCity = '',
  onSelectCity = () => {},
  availableCities,
}: ExploreHeaderProps) {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const cityOptions = React.useMemo(() => {
    if (Array.isArray(availableCities) && availableCities.length > 0) {
      return availableCities.map((c) => (c === 'Semua' ? 'Semua Lokasi' : c));
    }
    return ['Semua Lokasi', 'Bandung', 'Pangandaran', 'Bogor'];
  }, [availableCities]);

  const filteredCityOptions = React.useMemo(() => {
    if (!citySearchQuery.trim()) return cityOptions;
    const q = citySearchQuery.toLowerCase();
    return cityOptions.filter(
      (c) => c.toLowerCase().includes(q) || c === 'Semua Lokasi',
    );
  }, [cityOptions, citySearchQuery]);

  const handleGetCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Perangkat tidak mendukung deteksi lokasi.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        // Default to Bandung if coordinates are nearby West Java
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // Check closest city or default
        let matched = 'Bandung';
        if (lat < -7.3 && lng > 108.3) {
          matched = 'Pangandaran';
        }
        onSelectCity(matched);
        setIsCityModalOpen(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError('Izin akses lokasi ditolak atau tidak tersedia.');
      },
      { timeout: 8000 },
    );
  };

  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current && typeof document !== 'undefined') {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          '--explore-header-height',
          `${height}px`,
        );
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Official Brand Logo SVG */}
          <Link href="/explore" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/images/logo/primary_blue.svg"
              alt="Embun"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-102"
            />
            <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
              Explore
            </span>
          </Link>

          {/* Center: Airbnb-style Pill Search Bar (Desktop) */}
          {showSearch ? (
            <div className="flex-1 max-w-xl hidden md:flex items-center justify-center">
              <div className="w-full flex items-center justify-between border border-border rounded-full py-1.5 px-4 shadow-2xs hover:shadow-md transition-all bg-white divide-x divide-border text-xs focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue">
                {/* City Filter Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchQuery('');
                    setGeoError(null);
                    setIsCityModalOpen(true);
                  }}
                  className="px-3 py-1 text-left font-semibold text-foreground truncate hover:text-brand-blue transition-colors flex-1 flex items-center gap-1.5 cursor-pointer outline-none"
                >
                  <MapPin size={13} className="text-brand-blue shrink-0" />
                  <span className="truncate">
                    {selectedCity || 'Semua Lokasi'}
                  </span>
                </button>

                {/* Keyword Search Input */}
                <div className="pl-3 flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cari nama spot, glamping, area..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="w-full text-xs text-foreground placeholder:text-foreground-muted bg-transparent outline-none ring-0 border-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none py-1"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="p-1 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X size={13} />
                    </button>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-xs shrink-0">
                      <Search size={13} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Right: User Avatar Menu & Wishlist */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/wishlist"
              className="p-2 rounded-full border border-border hover:bg-surface text-foreground transition-colors cursor-pointer flex items-center justify-center"
              title="Wishlist Saya"
              aria-label="Wishlist Saya"
            >
              <Heart size={16} className="text-foreground" />
            </Link>

            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 border border-border rounded-full py-1.5 px-3 hover:shadow-md transition-all bg-white cursor-pointer text-xs font-semibold text-foreground"
              aria-label="Menu Pengguna"
            >
              {currentUser ? (
                <>
                  <Menu size={15} className="text-foreground-muted" />
                  <div className="w-6 h-6 rounded-full bg-[#c2410c] text-white flex items-center justify-center border border-brand-lime/80 font-bold text-xs overflow-hidden shrink-0 shadow-2xs">
                    {currentUser?.avatarUrl || currentUser?.photoUrl ? (
                      <img
                        src={resolveAssetUrl(
                          currentUser.avatarUrl || currentUser.photoUrl,
                        )}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-black text-xs select-none">
                        {(currentUser?.fullName || 'Tamu')
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">
                    {currentUser?.fullName?.split(' ')[0] || 'Akun'}
                  </span>
                </>
              ) : (
                <>
                  <User size={15} className="text-foreground-muted" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (under logo) */}
        {showSearch && (
          <div className="md:hidden px-4 pb-3 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 border border-border rounded-full py-2.5 px-4 shadow-2xs bg-surface text-xs focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue focus-within:bg-white transition-all">
              <Search size={15} className="text-brand-blue shrink-0" />
              <input
                type="text"
                placeholder="Cari spot, glamping, area..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                className="w-full text-xs text-foreground placeholder:text-foreground-muted bg-transparent outline-none ring-0 border-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none p-0 m-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-full hover:bg-surface-variant text-foreground-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setCitySearchQuery('');
                setGeoError(null);
                setIsCityModalOpen(true);
              }}
              className={`px-3.5 py-2.5 rounded-full border text-xs font-semibold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                selectedCity
                  ? 'bg-brand-blue text-white border-brand-blue font-bold shadow-2xs'
                  : 'bg-surface hover:bg-surface-variant text-foreground border-border'
              }`}
            >
              <MapPin
                size={13}
                className={selectedCity ? 'text-white' : 'text-brand-blue'}
              />
              <span className="max-w-[70px] truncate">
                {selectedCity || 'Lokasi'}
              </span>
            </button>
          </div>
        )}
      </header>

      {/* ── Modal Pilih Destinasi / Kota ── */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white text-foreground rounded-3xl shadow-2xl border border-border p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <MapPin size={15} className="text-brand-blue" />
                <span>Pilih Destinasi / Wilayah</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCityModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* GPS Location Button */}
            <button
              type="button"
              disabled={geoLoading}
              onClick={handleGetCurrentLocation}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-brand-blue/20"
            >
              <MapPin
                size={14}
                className={geoLoading ? 'animate-bounce' : ''}
              />
              <span>
                {geoLoading
                  ? 'Mendeteksi Lokasi Anda...'
                  : 'Gunakan Lokasi Saat Ini (Cek GPS)'}
              </span>
            </button>

            {geoError && (
              <p className="text-[11px] text-red-500 font-semibold text-center">
                {geoError}
              </p>
            )}

            {/* Search City Input */}
            <div className="flex items-center gap-2 border border-border rounded-2xl py-2 px-3 bg-surface text-xs focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:bg-white transition-all">
              <Search size={14} className="text-foreground-muted shrink-0" />
              <input
                type="text"
                placeholder="Cari nama kota atau wilayah..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-foreground placeholder:text-foreground-muted outline-none border-none ring-0 p-0"
              />
              {citySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCitySearchQuery('')}
                  className="p-0.5 text-foreground-muted hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* City Options Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto no-scrollbar">
              {filteredCityOptions.map((city) => {
                const isSelected =
                  (selectedCity || 'Semua Lokasi') === city ||
                  (!selectedCity && city === 'Semua Lokasi');
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      onSelectCity(city === 'Semua Lokasi' ? '' : city);
                      setIsCityModalOpen(false);
                    }}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-brand-blue text-white shadow-xs font-bold'
                        : 'bg-surface hover:bg-surface-variant text-foreground border border-border/80'
                    }`}
                  >
                    <span className="truncate">{city}</span>
                    {isSelected && (
                      <Check size={13} className="shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
