'use client';

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";

interface BookingCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInDate: string; // "YYYY-MM-DD"
  checkOutDate: string; // "YYYY-MM-DD"
  onSelectDates: (checkIn: string, checkOut: string) => void;
  spotName?: string;
  bookedDates?: string[];
  lang?: 'id' | 'en';
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDate(dateStr?: string, lang: 'id' | 'en' = 'id'): string {
  if (!dateStr) return lang === 'en' ? "Select Date" : "Pilih Tanggal";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(lang === 'en' ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getMonthDetails(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();
  return { startDayOfWeek, totalDays, year, month };
}

export function BookingCalendarModal({
  isOpen,
  onClose,
  checkInDate,
  checkOutDate,
  onSelectDates,
  spotName,
  bookedDates = [],
  lang = 'id',
}: BookingCalendarModalProps) {
  const monthNames = lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ID;
  const dayNames = lang === 'en' ? DAY_NAMES_EN : DAY_NAMES_ID;

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const bookedSet = useMemo(() => new Set(bookedDates || []), [bookedDates]);

  // Temporary selection states
  const [tempIn, setTempIn] = useState<string>(checkInDate || "");
  const [tempOut, setTempOut] = useState<string>(checkOutDate || "");
  const [activeStep, setActiveStep] = useState<"checkIn" | "checkOut">("checkIn");
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Helper to add days cleanly without timezone drift
  const addDaysStr = (dateStr: string, days: number): string => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + days));
    return date.toISOString().split("T")[0];
  };

  // Helper untuk mengecek apakah ada malam yang sudah penuh di antara dua tanggal [startStr, endStr)
  const hasBookedBetween = (startStr: string, endStr: string): boolean => {
    try {
      if (endStr <= startStr) return false;
      let cur = addDaysStr(startStr, 0);
      while (cur < endStr) {
        if (bookedSet.has(cur)) return true;
        cur = addDaysStr(cur, 1);
      }
      return false;
    } catch {
      return false;
    }
  };

  // Cek apakah tanggal candidate dapat dipilih sebagai check-out (half-open)
  const isSelectableAsCheckout = (checkInStr: string, candidateStr: string): boolean => {
    if (!checkInStr || candidateStr <= checkInStr) return false;
    return !hasBookedBetween(checkInStr, candidateStr);
  };

  // Initial month based on current checkInDate or today
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (checkInDate) {
      const [y, m] = checkInDate.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  // Sync state when modal is opened or external props change
  useEffect(() => {
    if (isOpen) {
      setTempIn(checkInDate || "");
      setTempOut(checkOutDate || "");
      setActiveStep(checkInDate && !checkOutDate ? "checkOut" : "checkIn");
      if (checkInDate) {
        const [y, m] = checkInDate.split("-").map(Number);
        setViewDate(new Date(y, m - 1, 1));
      } else {
        setViewDate(new Date());
      }
    }
  }, [isOpen, checkInDate, checkOutDate]);

  // Calculate current and next visible months
  const month1 = useMemo(
    () => getMonthDetails(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const month2 = useMemo(() => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    return getMonthDetails(next.getFullYear(), next.getMonth());
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const nightsCount = useMemo(() => {
    if (!tempIn || !tempOut) return 0;
    try {
      const start = new Date(tempIn);
      const end = new Date(tempOut);
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, [tempIn, tempOut]);

  const handleDateClick = (dateStr: string) => {
    if (dateStr < todayStr) return;

    // Jika belum memilih check-in atau kedua tanggal sudah terisi, mulai pilih check-in baru
    if (!tempIn || (tempIn && tempOut)) {
      if (bookedSet.has(dateStr)) return; // Tidak boleh check-in di hari yang sudah penuh
      setTempIn(dateStr);
      setTempOut("");
      setActiveStep("checkOut");
      return;
    }

    // Sedang memilih check-out (tempIn sudah ada, tempOut belum)
    if (dateStr <= tempIn) {
      if (bookedSet.has(dateStr)) return;
      setTempIn(dateStr);
      setTempOut("");
      setActiveStep("checkOut");
    } else {
      // dateStr > tempIn: cek apakah interval malam bebas
      const isIntervalFree = isSelectableAsCheckout(tempIn, dateStr);
      if (isIntervalFree) {
        setTempOut(dateStr);
        setActiveStep("checkIn");
      } else {
        // Melewati malam yang penuh, jika tanggal ini kosong mulai check-in baru dari sini
        if (!bookedSet.has(dateStr)) {
          setTempIn(dateStr);
          setTempOut("");
          setActiveStep("checkOut");
        }
      }
    }
  };

  const handleApply = () => {
    if (tempIn && tempOut) {
      onSelectDates(tempIn, tempOut);
      onClose();
    }
  };

  const handleReset = () => {
    setTempIn("");
    setTempOut("");
    setActiveStep("checkIn");
  };

  if (!isOpen) return null;

  const renderMonth = (m: {
    startDayOfWeek: number;
    totalDays: number;
    year: number;
    month: number;
  }) => {
    const days: React.ReactNode[] = [];

    // Empty lead cells
    for (let i = 0; i < m.startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10 sm:h-11 sm:w-11" />);
    }

    // Days in month
    for (let day = 1; day <= m.totalDays; day++) {
      const dayStr = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`;
      const isPast = dayStr < todayStr;
      const isBooked = bookedSet.has(dayStr);

      // Half-open check-out logic:
      // Ketika check-in sudah dipilih dan check-out belum, tanggal penuh yang berada tepat
      // setelah malam bebas (hari pergantian tamu / changeover) DAPAT dipilih sebagai check-out.
      const isCheckoutChangeover =
        Boolean(tempIn) &&
        !tempOut &&
        dayStr > tempIn &&
        isBooked &&
        isSelectableAsCheckout(tempIn, dayStr);

      const isDisabled = isPast || (isBooked && !isCheckoutChangeover);
      const isStart = dayStr === tempIn;
      const isEnd = dayStr === tempOut;
      const isInRange =
        tempIn && tempOut && dayStr > tempIn && dayStr < tempOut;
      const isHovered =
        tempIn &&
        !tempOut &&
        hoveredDate &&
        dayStr > tempIn &&
        dayStr <= hoveredDate &&
        !hasBookedBetween(tempIn, hoveredDate);

      const [y, mNum, d] = dayStr.split("-").map(Number);
      const dayOfWeek = new Date(y, mNum - 1, d).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Minggu atau Sabtu

      days.push(
        <div
          key={dayStr}
          className={`h-10 w-10 sm:h-11 sm:w-11 relative flex items-center justify-center p-0 ${
            isInRange || isHovered
              ? "bg-brand-blue/10 text-brand-blue"
              : ""
          } ${isStart && tempOut ? "rounded-l-full bg-brand-blue/10" : ""} ${
            isEnd && tempIn ? "rounded-r-full bg-brand-blue/10" : ""
          }`}
          onMouseEnter={() => !isDisabled && setHoveredDate(dayStr)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => handleDateClick(dayStr)}
            title={
              isCheckoutChangeover
                ? (lang === 'en'
                    ? "Check-out Date Available (Guest Changeover Day)"
                    : "Tanggal Check-out Tersedia (Hari Pergantian Tamu)")
                : isBooked
                ? (lang === 'en'
                    ? "Spot is fully booked on this date"
                    : "Spot sudah penuh di tanggal ini")
                : isPast
                ? (lang === 'en' ? "Past date" : "Tanggal lewat")
                : undefined
            }
            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center text-xs transition-all ${
              isStart || isEnd
                ? "bg-brand-blue text-white font-bold shadow-md scale-105 rounded-full"
                : isCheckoutChangeover
                ? `border-2 border-neutral-800 bg-white font-bold hover:scale-105 cursor-pointer shadow-2xs ${
                    isWeekend ? "text-red-500" : "text-foreground"
                  }`
                : isDisabled
                ? isBooked
                  ? "text-neutral-400 bg-neutral-100/80 line-through cursor-not-allowed opacity-60 rounded-full"
                  : "text-foreground-muted/30 line-through cursor-not-allowed rounded-full"
                : isInRange || isHovered
                ? "text-brand-blue font-bold hover:bg-brand-blue/20 rounded-full"
                : `${
                    isWeekend ? "text-red-500 font-semibold" : "text-foreground"
                  } hover:bg-surface hover:scale-105 cursor-pointer rounded-full`
            }`}
          >
            {day}
          </button>
        </div>,
      );
    }

    return (
      <div className="space-y-3">
        {/* Month & Year Title */}
        <div className="text-center font-bold text-sm sm:text-base text-foreground">
          {monthNames[m.month]} {m.year}
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayNames.map((d) => (
            <span
              key={d}
              className="text-[11px] font-bold text-foreground-muted/70 py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white text-foreground rounded-3xl shadow-2xl border border-border max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-border space-y-4 bg-surface/30">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
                  {nightsCount > 0
                    ? (lang === 'en'
                        ? `${nightsCount} Night${nightsCount > 1 ? 's' : ''}`
                        : `${nightsCount} Malam`)
                    : (lang === 'en' ? "Select Dates" : "Pilih Tanggal")}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                  {lang === 'en' ? "Set Stay Dates" : "Atur Jadwal Menginap"}
                </h3>
              </div>
              <p className="text-xs text-foreground-muted">
                {spotName
                  ? (lang === 'en'
                      ? `Select check-in & check-out dates for ${spotName}`
                      : `Pilih tanggal check-in & check-out untuk ${spotName}`)
                  : (lang === 'en'
                      ? "Select your arrival date followed by departure date"
                      : "Klik tanggal kedatangan lalu klik tanggal kepulangan Anda")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer shrink-0 -mr-1"
              aria-label={lang === 'en' ? "Close Calendar" : "Tutup Kalender"}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Date Indicator Tabs */}
          <div className="grid grid-cols-2 border border-border rounded-2xl p-1 bg-white shadow-2xs text-xs divide-x divide-border">
            <button
              type="button"
              onClick={() => setActiveStep("checkIn")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-semibold flex flex-col text-left ${
                activeStep === "checkIn"
                  ? "bg-brand-blue text-white shadow-xs"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider opacity-80">
                Check-In
              </span>
              <span className="text-xs font-bold whitespace-nowrap">
                {tempIn ? formatDate(tempIn, lang) : (lang === 'en' ? "Select Date" : "Pilih Tanggal")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep("checkOut")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer font-semibold flex flex-col text-left ${
                activeStep === "checkOut"
                  ? "bg-brand-blue text-white shadow-xs"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider opacity-80">
                Check-Out
              </span>
              <span className="text-xs font-bold whitespace-nowrap">
                {tempOut ? formatDate(tempOut, lang) : (lang === 'en' ? "Select Date" : "Pilih Tanggal")}
              </span>
            </button>
          </div>
        </div>

        {/* Calendar Nav & Dual-Month Container */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-full border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              title={lang === 'en' ? "Previous Month" : "Bulan Sebelumnya"}
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-xs font-semibold text-foreground-muted hidden sm:inline-block">
              {lang === 'en'
                ? "Use arrows to browse months"
                : "Gunakan tanda panah untuk menjelajahi bulan"}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-full border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              title={lang === 'en' ? "Next Month" : "Bulan Berikutnya"}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Month Views (1 on Mobile, 2 on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x md:divide-border/80">
            <div>{renderMonth(month1)}</div>
            <div className="hidden md:block md:pl-8">{renderMonth(month2)}</div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-border/50 text-[11px] text-foreground-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-brand-blue" />
              <span>{lang === 'en' ? "Selected" : "Terpilih"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white border border-border" />
              <span>{lang === 'en' ? "Available" : "Tersedia"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-400 line-through flex items-center justify-center text-[9px] font-bold">✕</span>
              <span>{lang === 'en' ? "Booked / Unavailable" : "Penuh / Dipesan"}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface/40 flex items-center justify-between gap-2 sm:gap-4 mt-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-brand-blue dark:hover:text-brand-lime cursor-pointer transition-colors shrink-0"
          >
            <RotateCcw size={13} />
            <span>{lang === 'en' ? "Reset Dates" : "Reset Tanggal"}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-2xl border border-border hover:bg-surface text-xs font-semibold text-foreground transition-all cursor-pointer"
            >
              {lang === 'en' ? "Cancel" : "Batal"}
            </button>
            {tempIn && tempOut ? (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 sm:px-5 py-2.5 rounded-2xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Check size={14} />
                <span>
                  {lang === 'en'
                    ? `Save (${nightsCount} Night${nightsCount > 1 ? 's' : ''})`
                    : `Simpan (${nightsCount} Malam)`}
                </span>
              </button>
            ) : tempIn ? (
              <button
                type="button"
                disabled
                className="px-4 sm:px-5 py-2.5 rounded-2xl bg-brand-lime text-black text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-default whitespace-nowrap"
              >
                <span>{lang === 'en' ? "Select check-out date" : "Pilih tanggal check-out"}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="px-4 sm:px-5 py-2.5 rounded-2xl bg-surface border border-border text-foreground-muted text-xs font-semibold cursor-default whitespace-nowrap"
              >
                <span>{lang === 'en' ? "Select check-in date" : "Pilih tanggal check-in"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
