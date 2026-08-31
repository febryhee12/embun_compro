'use client';

import React, { useState, useMemo } from "react";
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
}

const MONTH_NAMES = [
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

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function formatIndoDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("id-ID", {
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
}: BookingCalendarModalProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Temporary selection states
  const [tempIn, setTempIn] = useState<string>(checkInDate || todayStr);
  const [tempOut, setTempOut] = useState<string>(checkOutDate || "");
  const [activeStep, setActiveStep] = useState<"checkIn" | "checkOut">("checkIn");
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Initial month based on current checkInDate or today
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (checkInDate) {
      const [y, m] = checkInDate.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

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

    if (activeStep === "checkIn") {
      setTempIn(dateStr);
      setTempOut("");
      setActiveStep("checkOut");
    } else {
      // selecting checkOut
      if (dateStr <= tempIn) {
        // User clicked earlier date -> reset check-in to this date
        setTempIn(dateStr);
        setTempOut("");
        setActiveStep("checkOut");
      } else {
        setTempOut(dateStr);
        setActiveStep("checkIn");
      }
    }
  };

  const handleApply = () => {
    if (tempIn && tempOut) {
      onSelectDates(tempIn, tempOut);
      onClose();
    } else if (tempIn) {
      // Auto set 1 night if checkOut is not selected
      const d = new Date(tempIn);
      d.setDate(d.getDate() + 1);
      const nextDayStr = d.toISOString().split("T")[0];
      onSelectDates(tempIn, nextDayStr);
      onClose();
    }
  };

  const handleReset = () => {
    setTempIn(todayStr);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setTempOut(d.toISOString().split("T")[0]);
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
      const isStart = dayStr === tempIn;
      const isEnd = dayStr === tempOut;
      const isInRange =
        tempIn && tempOut && dayStr > tempIn && dayStr < tempOut;
      const isHovered =
        tempIn &&
        !tempOut &&
        hoveredDate &&
        dayStr > tempIn &&
        dayStr <= hoveredDate;

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
          onMouseEnter={() => !isPast && setHoveredDate(dayStr)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <button
            type="button"
            disabled={isPast}
            onClick={() => handleDateClick(dayStr)}
            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
              isPast
                ? "text-foreground-muted/30 line-through cursor-not-allowed"
                : isStart || isEnd
                ? "bg-brand-blue text-white font-bold shadow-md scale-105"
                : isInRange || isHovered
                ? "text-brand-blue font-bold hover:bg-brand-blue/20"
                : "text-foreground hover:bg-surface hover:scale-105"
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
          {MONTH_NAMES[m.month]} {m.year}
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((d) => (
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
        <div className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
                {nightsCount > 0 ? `${nightsCount} Malam` : "Pilih Tanggal"}
              </span>
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                {tempIn && tempOut
                  ? `${formatIndoDate(tempIn)} — ${formatIndoDate(tempOut)}`
                  : "Atur Jadwal Menginap"}
              </h3>
            </div>
            <p className="text-xs text-foreground-muted">
              {spotName
                ? `Pilih tanggal check-in & check-out untuk ${spotName}`
                : "Klik tanggal kedatangan lalu klik tanggal kepulangan Anda"}
            </p>
          </div>

          {/* Quick Date Indicator Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-2xl p-1 bg-white shadow-2xs text-xs divide-x divide-border">
              <button
                type="button"
                onClick={() => setActiveStep("checkIn")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold flex flex-col text-left ${
                  activeStep === "checkIn"
                    ? "bg-brand-blue text-white shadow-xs"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider opacity-80">
                  Check-In
                </span>
                <span className="text-xs font-bold whitespace-nowrap">
                  {formatIndoDate(tempIn)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep("checkOut")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold flex flex-col text-left ${
                  activeStep === "checkOut"
                    ? "bg-brand-blue text-white shadow-xs"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider opacity-80">
                  Check-Out
                </span>
                <span className="text-xs font-bold whitespace-nowrap">
                  {tempOut ? formatIndoDate(tempOut) : "Pilih Tanggal"}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={18} />
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
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-xs font-semibold text-foreground-muted hidden sm:inline-block">
              Gunakan tanda panah untuk menjelajahi bulan
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-full border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Month Views (1 on Mobile, 2 on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x md:divide-border/80">
            <div>{renderMonth(month1)}</div>
            <div className="hidden md:block md:pl-8">{renderMonth(month2)}</div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface/40 flex items-center justify-between gap-4 mt-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-brand-blue cursor-pointer underline transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Tanggal</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-border hover:bg-surface text-xs font-semibold text-foreground transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-2xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check size={14} />
              <span>Simpan & Terapkan ({nightsCount || 1} Malam)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
