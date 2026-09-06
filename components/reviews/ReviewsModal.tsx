'use client';

import React, { useState, useMemo } from 'react';
import {
  Star,
  X,
  Search,
  Camera,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { resolveAssetUrl } from '@/lib/api-client';
import { TranslatableBox } from '@/components/ui/TranslatableBox';

export interface ReviewItem {
  id: string;
  rating?: number;
  message?: string;
  comment?: string;
  content?: string;
  review?: string;
  createdAt?: string;
  maskedAuthorName?: string;
  authorName?: string;
  guestName?: string;
  userName?: string;
  user?: { name?: string; fullName?: string };
  authorPhotoUrl?: string | null;
  guestAvatar?: string | null;
  photoUrl?: string | null;
  spotName?: string;
  blockName?: string;
}

export interface ReviewAggregate {
  ratingAvg?: number;
  ratingCount?: number;
  ratingBreakdown?: Record<string, number>;
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ReviewItem[];
  targetName: string;
  aggregate?: ReviewAggregate | null;
  lang?: 'id' | 'en';
}

export function ReviewsModal({
  isOpen,
  onClose,
  reviews = [],
  targetName,
  aggregate,
  lang = 'id',
}: ReviewsModalProps) {
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [onlyPhotos, setOnlyPhotos] = useState<boolean>(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Perhitungan rating rata-rata & jumlah ulasan
  const totalCount = reviews.length;
  const ratingAvg = useMemo(() => {
    if (aggregate?.ratingAvg != null && aggregate.ratingAvg > 0) {
      return aggregate.ratingAvg;
    }
    if (totalCount === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return Math.round((sum / totalCount) * 10) / 10;
  }, [aggregate, reviews, totalCount]);

  // Distribusi bintang (5, 4, 3, 2, 1) ala Airbnb
  const starDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    return [5, 4, 3, 2, 1].map((star) => {
      const count = counts[star] || 0;
      const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { star, count, percentage };
    });
  }, [reviews, totalCount]);

  const countWithPhotos = useMemo(() => {
    return reviews.filter((r) => Boolean(r.photoUrl)).length;
  }, [reviews]);

  // Filter Reviews (Bintang & Foto)
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      if (selectedStar !== null && star !== selectedStar) {
        return false;
      }
      if (onlyPhotos && !r.photoUrl) {
        return false;
      }
      return true;
    });
  }, [reviews, selectedStar, onlyPhotos]);

  const handleResetFilters = () => {
    setSelectedStar(null);
    setOnlyPhotos(false);
  };

  const isFiltered = selectedStar !== null || onlyPhotos;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border flex flex-col h-[90vh] sm:h-[85vh] max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* ═══ MOBILE DRAG HANDLE STRIP ═══ */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden bg-white shrink-0">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
        </div>

        {/* ═══ TOP HEADER ═══ */}
        <div className="px-5 py-3.5 sm:px-8 sm:py-5 border-b border-border flex items-center justify-between shrink-0 bg-white">
          <div className="space-y-0.5 min-w-0 pr-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
              {lang === 'en'
                ? `Guest Reviews · ${targetName}`
                : `Ulasan Tamu · ${targetName}`}
            </h2>
            <p className="text-[11px] sm:text-xs text-foreground-muted">
              {lang === 'en'
                ? 'Authentic experiences and verified reviews from Embun guests'
                : 'Pengalaman nyata dan ulasan terverifikasi dari pengunjung Embun'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-neutral-100/90 hover:bg-neutral-200 text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
            aria-label={lang === 'en' ? 'Close' : 'Tutup'}
          >
            <X size={16} className="text-foreground" />
          </button>
        </div>

        {/* ═══ MAIN MODAL BODY (AIRBNB 2-COLUMN ON DESKTOP) ═══ */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border bg-white">
          {/* SISI KIRI: RATING OVERVIEW, AIRBNB PROGRESS BARS & FILTER TABS (COL 5 DESKTOP) */}
          <div className="md:col-span-5 p-5 sm:p-6 overflow-y-auto space-y-6 bg-white">
            {/* Big Rating Summary */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2.5">
                <div className="flex items-center gap-1 text-2xl sm:text-3xl font-black text-foreground">
                  <Star size={26} className="fill-amber-400 text-amber-400" />
                  <span>{ratingAvg.toFixed(1)}</span>
                </div>
                <span className="text-xs font-semibold text-foreground-muted">
                  {lang === 'en' ? 'out of 5.0' : 'dari 5.0'}
                </span>
              </div>
              <p className="text-xs text-foreground-muted font-medium">
                {lang === 'en' ? (
                  <>
                    Based on <strong>{totalCount} verified</strong> guest reviews
                  </>
                ) : (
                  <>
                    Berdasarkan <strong>{totalCount} ulasan</strong> tamu terverifikasi
                  </>
                )}
              </p>
            </div>

            {/* Airbnb Style Rating Breakdown Bars */}
            <div className="space-y-2 pt-2 border-t border-border/70">
              <div className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                {lang === 'en' ? 'Rating Distribution' : 'Distribusi Rating'}
              </div>
              <div className="space-y-1.5">
                {starDistribution.map(({ star, count, percentage }) => {
                  const isSelected = selectedStar === star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setSelectedStar(isSelected ? null : star)
                      }
                      className={`w-full flex items-center gap-2.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer text-left group ${
                        isSelected
                          ? 'bg-brand-blue/10 ring-1 ring-brand-blue/30 font-bold'
                          : 'hover:bg-surface'
                      }`}
                    >
                      {/* Star label */}
                      <span className="text-xs font-bold w-7 text-foreground flex items-center gap-1 shrink-0">
                        <span>{star}</span>
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                      </span>

                      {/* Bar track */}
                      <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isSelected ? 'bg-brand-blue' : 'bg-neutral-800'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Count & Percentage */}
                      <span className="text-[11px] font-medium text-foreground-muted w-12 text-right shrink-0">
                        {count} ({percentage}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Pills / Buttons */}
            <div className="space-y-2 pt-2 border-t border-border/70">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal size={12} />
                  <span>{lang === 'en' ? 'Star Filter' : 'Filter Bintang'}</span>
                </span>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-brand-blue font-bold lowercase first-letter:uppercase hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw size={10} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedStar(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedStar === null
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-white border border-border text-foreground hover:bg-surface'
                  }`}
                >
                  {lang === 'en' ? `All (${totalCount})` : `Semua (${totalCount})`}
                </button>

                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    starDistribution.find((d) => d.star === star)?.count || 0;
                  const isSelected = selectedStar === star;
                  if (count === 0 && !isSelected) return null;

                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setSelectedStar(isSelected ? null : star)
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-brand-blue text-white shadow-xs'
                          : 'bg-white border border-border text-foreground hover:bg-surface'
                      }`}
                    >
                      <Star
                        size={11}
                        className={
                          isSelected
                            ? 'fill-white text-white'
                            : 'fill-amber-400 text-amber-400'
                        }
                      />
                      <span>{lang === 'en' ? `${star} Stars` : `${star} Bintang`}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ml-0.5 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-surface text-foreground-muted'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {countWithPhotos > 0 && (
                  <button
                    type="button"
                    onClick={() => setOnlyPhotos(!onlyPhotos)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlyPhotos
                        ? 'bg-brand-blue text-white shadow-xs'
                        : 'bg-white border border-border text-foreground hover:bg-surface'
                    }`}
                  >
                    <Camera size={12} />
                    <span>{lang === 'en' ? `With Photos (${countWithPhotos})` : `Dengan Foto (${countWithPhotos})`}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SISI KANAN: DAFTAR ULASAN (COL 7 DESKTOP) */}
          <div className="md:col-span-7 p-5 sm:p-6 overflow-y-auto space-y-5 bg-white">
            {/* Filter Status Badge / Counter */}
            <div className="flex items-center justify-between text-xs text-foreground-muted pb-2 border-b border-border/60">
              <span>
                {lang === 'en' ? (
                  <>
                    Showing <strong className="text-foreground">{filteredReviews.length}</strong> of {totalCount} reviews
                    {selectedStar !== null && ` (${selectedStar} Stars)`}
                    {onlyPhotos && ' (With Photos)'}
                  </>
                ) : (
                  <>
                    Menampilkan <strong className="text-foreground">{filteredReviews.length}</strong> dari {totalCount} ulasan
                    {selectedStar !== null && ` (Bintang ${selectedStar})`}
                    {onlyPhotos && ' (Dengan Foto)'}
                  </>
                )}
              </span>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-brand-blue font-semibold hover:underline cursor-pointer"
                >
                  {lang === 'en' ? 'Show All' : 'Tampilkan Semua'}
                </button>
              )}
            </div>

            {/* Empty State when no reviews match */}
            {filteredReviews.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-foreground-muted">
                  <Star size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">
                    {lang === 'en' ? 'No Reviews Found' : 'Tidak Ditemukan Ulasan'}
                  </h4>
                  <p className="text-xs text-foreground-muted max-w-xs mx-auto">
                    {lang === 'en'
                      ? 'No reviews match your selected filter criteria.'
                      : 'Belum ada ulasan yang cocok dengan kriteria filter Anda.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Reset Filters' : 'Reset Filter'}
                </button>
              </div>
            ) : (
              <div className="space-y-5 divide-y divide-border/60">
                {filteredReviews.map((rev, idx) => {
                  const displayName =
                    rev.maskedAuthorName ||
                    rev.authorName ||
                    rev.guestName ||
                    rev.userName ||
                    rev.user?.fullName ||
                    rev.user?.name ||
                    (lang === 'en' ? 'Embun Guest' : 'Tamu Embun');
                  const avatarChar = displayName.trim().charAt(0).toUpperCase();
                  const reviewText =
                    rev.message ||
                    rev.comment ||
                    rev.content ||
                    rev.review ||
                    '';
                  const ratingVal = Number(rev.rating || 5);
                  const spotLabel = rev.spotName || rev.blockName;

                  return (
                    <div
                      key={rev.id || idx}
                      className="pt-5 first:pt-0 space-y-3"
                    >
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#c2410c] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-brand-lime/80 shadow-2xs">
                            {rev.authorPhotoUrl || rev.guestAvatar ? (
                              <img
                                src={resolveAssetUrl(
                                  rev.authorPhotoUrl || rev.guestAvatar || '',
                                )}
                                alt={displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{avatarChar}</span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-foreground">
                                {displayName}
                              </span>
                              <span title={lang === 'en' ? 'Verified Guest' : 'Pengunjung Terverifikasi'} className="inline-flex items-center">
                                <CheckCircle2
                                  size={13}
                                  className="text-emerald-600"
                                />
                              </span>
                            </div>
                            <p className="text-[11px] text-foreground-muted">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString(
                                    lang === 'en' ? 'en-US' : 'id-ID',
                                    {
                                      month: 'long',
                                      year: 'numeric',
                                    },
                                  )
                                : (lang === 'en' ? 'Verified Guest' : 'Pengunjung Terverifikasi')}
                              {spotLabel && ` · Spot ${spotLabel}`}
                            </p>
                          </div>
                        </div>

                        {/* Rating Pill */}
                        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-border text-xs font-bold text-foreground shrink-0 shadow-2xs">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{ratingVal.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Review Text with On-demand Translation */}
                      {reviewText && (
                        <div className="pt-0.5">
                          <TranslatableBox
                            text={`“${reviewText.trim()}”`}
                            lang={lang}
                            textClassName="text-xs sm:text-sm text-foreground/90 leading-relaxed italic"
                          />
                        </div>
                      )}

                      {/* Photo Attachment if available */}
                      {rev.photoUrl && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto(resolveAssetUrl(rev.photoUrl || ''))}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-border group relative cursor-pointer block"
                          >
                            <img
                              src={resolveAssetUrl(rev.photoUrl)}
                              alt="Foto dari pengunjung"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Search size={16} />
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Preview Foto Ulasan */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={previewPhoto}
              alt="Foto ulasan diperbesar"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup foto"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
