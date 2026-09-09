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
    const list: any[] = [];
    const addedUrls = new Set<string>();

    const parseHotspotsList = (raw: any): any[] => {
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string' && raw.trim().length > 0) {
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const findMatchingPin = (rawHotspots: any, targetSpot: any) => {
      if (!targetSpot) return null;
      const hsList = parseHotspotsList(rawHotspots);
      if (hsList.length === 0) return null;

      const targetIds = [
        targetSpot.id,
        targetSpot.blockId,
        targetSpot.shareCode,
      ].filter(Boolean).map((s) => String(s).trim().toLowerCase());

      const targetNames = [
        targetSpot.name,
        targetSpot.blockNumber,
        targetSpot.label,
      ].filter(Boolean).map((s) => String(s).trim().toLowerCase());

      return hsList.find((h: any) => {
        // Abaikan hotspot tipe scene / perpindahan area
        if (h.type === 'scene' || h.iconStyle === 'arrow_up') return false;

        const hIds = [h.blockId, h.targetSpotId].filter(Boolean).map((s) => String(s).trim().toLowerCase());
        for (const hid of hIds) {
          if (targetIds.includes(hid)) return true;
        }
        const hLabels = [h.targetLabel, h.label, h.text].filter(Boolean).map((s) => String(s).trim().toLowerCase());
        for (const hlabel of hLabels) {
          if (targetNames.includes(hlabel)) return true;
        }
        return false;
      });
    };

    const addPano = (p: any, isLinked = false) => {
      const url = (p.imageUrl || p.url || p.panoramaImageUrl || '').trim();
      if (!url || addedUrls.has(url)) return;
      addedUrls.add(url);

      const rawHs = p.panoramaHotspots || p.hotspots || [];
      const matchPin = findMatchingPin(rawHs, spot);
      const pinYaw = matchPin?.yaw !== undefined && matchPin?.yaw !== null ? Number(matchPin.yaw) : null;
      const pinPitch = matchPin?.pitch !== undefined && matchPin?.pitch !== null ? Number(matchPin.pitch) : null;

      const explicitYaw =
        isLinked &&
        spot.linkedPanoramaYaw !== undefined &&
        spot.linkedPanoramaYaw !== null &&
        !isNaN(Number(spot.linkedPanoramaYaw))
          ? Number(spot.linkedPanoramaYaw)
          : null;
      const explicitPitch =
        isLinked &&
        spot.linkedPanoramaPitch !== undefined &&
        spot.linkedPanoramaPitch !== null &&
        !isNaN(Number(spot.linkedPanoramaPitch))
          ? Number(spot.linkedPanoramaPitch)
          : null;

      const resolvedYaw = explicitYaw !== null
        ? explicitYaw
        : pinYaw !== null
          ? pinYaw
          : (p.panoramaYaw !== undefined && p.panoramaYaw !== null && !isNaN(Number(p.panoramaYaw)))
            ? Number(p.panoramaYaw)
            : (p.yaw !== undefined && p.yaw !== null && !isNaN(Number(p.yaw)))
              ? Number(p.yaw)
              : 0;

      const resolvedPitch = explicitPitch !== null
        ? explicitPitch
        : pinPitch !== null
          ? pinPitch
          : (p.panoramaPitch !== undefined && p.panoramaPitch !== null && !isNaN(Number(p.panoramaPitch)))
            ? Number(p.panoramaPitch)
            : (p.pitch !== undefined && p.pitch !== null && !isNaN(Number(p.pitch)))
              ? Number(p.pitch)
              : 0;

      const item = {
        id: p.id || `pano-${list.length}`,
        label: p.label || p.description || p.caption || (isLinked ? `${spot.name} (View 360°)` : 'Tur 360° Kawasan'),
        imageUrl: url,
        hotspots: rawHs,
        yaw: resolvedYaw,
        pitch: resolvedPitch,
        category: matchPin || isLinked ? 'panorama_linked' : (p.category || 'campsite_panorama'),
      };

      list.push(item);
    };

    // 1. Check spot.linkedPanoramaSpotId
    if (spot.linkedPanoramaSpotId && Array.isArray((spot.campsite as any)?.panoramaSpots)) {
      const linked = (spot.campsite as any).panoramaSpots.find(
        (ps: any) => ps.id === spot.linkedPanoramaSpotId,
      );
      if (linked) addPano(linked, true);
    }

    // 2. Interior panoramaPhotos
    if (Array.isArray(spot.panoramaPhotos)) {
      spot.panoramaPhotos.forEach((p: any) => addPano(p));
    }

    // 3. Campsite panoramaSpots
    if (Array.isArray((spot.campsite as any)?.panoramaSpots)) {
      (spot.campsite as any).panoramaSpots.forEach((p: any) => addPano(p));
    }

    // 4. Campsite maps markers
    if (Array.isArray((spot.campsite as any)?.maps)) {
      for (const m of (spot.campsite as any).maps) {
        if (Array.isArray(m.markers)) {
          for (const marker of m.markers) {
            if (marker.type === 'panorama' || marker.panoramaImageUrl) {
              addPano(marker);
            }
          }
        }
      }
    }

    // 5. Fallback photos category 360
    if (list.length === 0 && Array.isArray(spot.photos)) {
      const p360 = spot.photos.filter((p: any) =>
        (p.category || '').toLowerCase().includes('360'),
      );
      p360.forEach((p: any) => addPano(p));
    }

    // Urutkan agar panorama yang memuat pin spot ini selalu muncul pertama kali
    list.sort((a, b) => {
      const aScore = a.category === 'panorama_linked' ? 1 : 0;
      const bScore = b.category === 'panorama_linked' ? 1 : 0;
      return bScore - aScore;
    });

    return list;
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
                          const targetPano = panoramaList[targetIdx];
                          pannellumViewerRef.current.loadScene(
                            targetPano.id,
                            targetPano.pitch !== undefined ? Number(targetPano.pitch) : 0,
                            targetPano.yaw !== undefined ? Number(targetPano.yaw) : 0,
                          );
                        } catch (_) {}
                      }
                    }
                  }
                };
              },
            };
          });

          // Ensure URL has ?pano=360 so it never reuses non-CORS <img> cached entry in Incognito/Mobile
          const rawPanoUrl = resolveAssetUrl(pano.imageUrl);
          const safePanoUrl = rawPanoUrl
            ? (rawPanoUrl.includes('?') ? `${rawPanoUrl}&pano=360` : `${rawPanoUrl}?pano=360`)
            : '';

          scenesConfig[pano.id] = {
            type: 'equirectangular',
            panorama: safePanoUrl,
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
          if (activePano && activePano.yaw !== undefined && activePano.pitch !== undefined) {
            try {
              pannellumViewerRef.current?.lookAt(
                Number(activePano.pitch || 0),
                Number(activePano.yaw || 0),
                90,
                false,
              );
            } catch (_) {}
          }
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
          pannellumViewerRef.current.loadScene(
            target.id,
            target.pitch !== undefined ? Number(target.pitch) : 0,
            target.yaw !== undefined ? Number(target.yaw) : 0,
          );
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
              onContextMenu={(e) => e.preventDefault()}
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
