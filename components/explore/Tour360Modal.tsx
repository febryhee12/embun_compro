'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCw, Compass, ExternalLink } from 'lucide-react';
import { resolveAssetUrl } from '@/lib/api-client';
import { SpotData } from './SpotCard';

let pannellumPromise: Promise<any> | null = null;
function loadPannellum(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).pannellum) return Promise.resolve((window as any).pannellum);
  if (pannellumPromise) return pannellumPromise;
  pannellumPromise = new Promise((resolve) => {
    if (!document.getElementById('pannellum-css')) {
      const link = document.createElement('link');
      link.id = 'pannellum-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.async = true;
    script.onload = () => resolve((window as any).pannellum);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
  return pannellumPromise;
}

interface Tour360ModalProps {
  spot: SpotData | null;
  onClose: () => void;
}

export function Tour360Modal({ spot, onClose }: Tour360ModalProps) {
  const [activePanoramaIdx, setActivePanoramaIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const panoramaContainerRef = useRef<HTMLDivElement | null>(null);
  const pannellumViewerRef = useRef<any>(null);

  const panoramaList: any[] = React.useMemo(() => {
    if (!spot) return [];
    if (Array.isArray(spot.panoramaPhotos) && spot.panoramaPhotos.length > 0) {
      return spot.panoramaPhotos;
    }
    if (
      Array.isArray((spot.campsite as any)?.panoramaSpots) &&
      (spot.campsite as any).panoramaSpots.length > 0
    ) {
      return (spot.campsite as any).panoramaSpots;
    }
    // Fallback to photos if category 360
    if (Array.isArray(spot.photos)) {
      const p360 = spot.photos.filter((p: any) =>
        (p.category || '').toLowerCase().includes('360'),
      );
      if (p360.length > 0) {
        return p360.map((p: any, idx: number) => ({
          id: p.id || `pano-${idx}`,
          label: p.caption || `Spot 360° ${idx + 1}`,
          imageUrl: p.url,
        }));
      }
    }
    return [];
  }, [spot]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!spot) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [spot]);

  // Reset active index when spot changes
  useEffect(() => {
    setActivePanoramaIdx(0);
  }, [spot?.id]);

  // Initialize Pannellum
  useEffect(() => {
    if (!spot || panoramaList.length === 0) return;
    let destroyed = false;
    setLoading(true);

    const init = async () => {
      const pannellum = await loadPannellum();
      if (destroyed || !pannellum || !panoramaContainerRef.current) return;

      try {
        if (pannellumViewerRef.current) {
          try {
            pannellumViewerRef.current.destroy();
          } catch (_) {}
          pannellumViewerRef.current = null;
        }

        const container = panoramaContainerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const scenesConfig: Record<string, any> = {};
        panoramaList.forEach((pano) => {
          const rawHotspots: any[] = (() => {
            const hs = (pano as any).hotspots;
            if (Array.isArray(hs)) return hs;
            if (typeof hs === 'string' && hs.trim().length > 0) {
              try {
                return JSON.parse(hs);
              } catch {
                return [];
              }
            }
            return [];
          })();

          const pannellumHotSpots = rawHotspots.map((h: any) => {
            const isScene =
              h.type === 'scene' || h.iconStyle === 'arrow_up' || !h.blockId;
            const label =
              h.targetLabel ||
              h.text ||
              h.label ||
              (isScene ? 'Pindah Area' : 'Spot Kavling');
            return {
              pitch: Number(h.pitch || 0),
              yaw: Number(h.yaw || 0),
              type: 'custom',
              createTooltipFunc: (hotSpotDiv: HTMLElement) => {
                hotSpotDiv.innerHTML = `
                  <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%); transition: transform 0.15s ease-out;" onmouseover="this.style.transform='translate(-50%, -50%) scale(1.1)'" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'">
                    <div style="background: rgba(15, 23, 42, 0.9); color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 4px 14px rgba(0,0,0,0.6); white-space: nowrap; margin-bottom: 5px; backdrop-filter: blur(4px);">
                      ${label}
                    </div>
                    <div style="width: 34px; height: 34px; border-radius: 50%; background: rgba(15, 23, 42, 0.92); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.7); backdrop-filter: blur(4px);">
                      ${
                        isScene
                          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.8"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
                          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
                      }
                    </div>
                  </div>
                `;
                hotSpotDiv.onclick = (e) => {
                  e.stopPropagation();
                  if (h.targetSpotId) {
                    const targetIdx = panoramaList.findIndex(
                      (p) =>
                        p.id === h.targetSpotId ||
                        p.label?.toLowerCase() ===
                          h.targetLabel?.toLowerCase() ||
                        p.label?.toLowerCase() === label.toLowerCase(),
                    );
                    if (targetIdx >= 0) {
                      setActivePanoramaIdx(targetIdx);
                      if (pannellumViewerRef.current) {
                        try {
                          pannellumViewerRef.current.loadScene(
                            panoramaList[targetIdx].id,
                          );
                        } catch (_) {}
                      }
                    }
                  }
                };
              },
            };
          });

          scenesConfig[pano.id] = {
            type: 'equirectangular',
            panorama: resolveAssetUrl(pano.imageUrl),
            yaw: pano.yaw !== undefined ? Number(pano.yaw) : 0,
            pitch: pano.pitch !== undefined ? Number(pano.pitch) : 0,
            hotSpots: pannellumHotSpots,
          };
        });

        const activePano =
          panoramaList[activePanoramaIdx] || panoramaList[0];

        pannellumViewerRef.current = pannellum.viewer(container, {
          default: {
            firstScene: activePano.id,
            sceneFadeDuration: 600,
            autoLoad: true,
            crossOrigin: 'anonymous',
            compass: false,
            yaw: activePano.yaw !== undefined ? Number(activePano.yaw) : 0,
            pitch:
              activePano.pitch !== undefined ? Number(activePano.pitch) : 0,
            hfov: 90,
            minHfov: 50,
            maxHfov: 110,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
            mouseZoom: true,
          },
          scenes: scenesConfig,
        });

        pannellumViewerRef.current.on('load', () => {
          setLoading(false);
        });
      } catch (err) {
        console.error('Error init pannellum:', err);
        setLoading(false);
      }
    };

    void init();

    return () => {
      destroyed = true;
      if (pannellumViewerRef.current) {
        try {
          pannellumViewerRef.current.destroy();
        } catch (_) {}
        pannellumViewerRef.current = null;
      }
    };
  }, [spot, panoramaList]);

  // Switch scene when activePanoramaIdx changes
  useEffect(() => {
    if (!pannellumViewerRef.current || panoramaList.length === 0) return;
    const target = panoramaList[activePanoramaIdx];
    if (!target) return;
    try {
      if (typeof pannellumViewerRef.current.getScene === 'function') {
        const currentScene = pannellumViewerRef.current.getScene();
        if (currentScene !== target.id) {
          pannellumViewerRef.current.loadScene(target.id);
        }
      }
    } catch (_) {}
  }, [activePanoramaIdx, panoramaList]);

  if (!spot) return null;

  const currentPano = panoramaList[activePanoramaIdx] || panoramaList[0];
  const campsiteName = spot.campsite?.name || 'Embun';
  const detailUrl = `/spot/${spot.campsite?.slug || spot.campsite?.id || spot.shareCode || spot.id}`;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="h-16 shrink-0 px-4 sm:px-8 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-lime text-black">
                Tur 360°
              </span>
              <span className="font-bold text-sm truncate max-w-xs sm:max-w-md text-white">
                {currentPano?.label || spot.name}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              {campsiteName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={detailUrl}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15"
          >
            <span>Rincian Campsite</span>
            <ExternalLink size={13} />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Main 360 Viewer Viewport */}
      <div className="flex-1 relative overflow-hidden bg-neutral-950 flex items-center justify-center">
        {panoramaList.length === 0 ? (
          <div className="max-w-md space-y-3 text-center p-6">
            <Compass size={48} className="mx-auto text-brand-lime animate-pulse" />
            <h3 className="text-white font-bold text-base">
              Tur 360° Segera Hadir
            </h3>
            <p className="text-neutral-400 text-xs">
              Foto panorama 360° untuk area ini sedang disiapkan. Silakan kunjungi halaman campsite untuk informasi lengkap.
            </p>
            <a
              href={detailUrl}
              className="inline-block mt-2 px-5 py-2.5 rounded-full bg-brand-lime text-black text-xs font-bold hover:scale-105 transition-transform"
            >
              Buka Halaman Campsite
            </a>
          </div>
        ) : (
          <>
            {/* Multi-scene switcher pills */}
            {panoramaList.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 max-w-[90vw] overflow-x-auto no-scrollbar">
                {panoramaList.map((pano, pIdx) => (
                  <button
                    key={pano.id || pIdx}
                    type="button"
                    onClick={() => setActivePanoramaIdx(pIdx)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activePanoramaIdx === pIdx
                        ? 'bg-brand-lime text-black shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {pano.label || `Area ${pIdx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Pannellum Container */}
            <div
              ref={panoramaContainerRef}
              className="w-full h-full"
            />

            {/* Hint at bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/90 flex items-center gap-2 pointer-events-none shadow-2xl z-20">
              <RotateCw size={14} className="text-brand-lime animate-spin" />
              <span>Geser layar / mouse untuk berputar 360°</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
