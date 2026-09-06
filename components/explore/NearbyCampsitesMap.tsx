'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { fetchActiveCampsites, resolveAssetUrl } from '@/lib/api-client';

export interface NearbyCampsitesMapProps {
  currentCampsite: {
    id: string;
    name: string;
    latitude?: number | string;
    longitude?: number | string;
    address?: string;
    city?: string;
    province?: string;
    slug?: string;
    googleMapsUrl?: string;
  };
  lang?: 'id' | 'en';
}

interface CampsiteWithDistance {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude: number;
  longitude: number;
  photos?: any[];
  images?: string[];
  distanceKm: number;
  isCurrent: boolean;
}

function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function NearbyCampsitesMap({
  currentCampsite,
  lang = 'id',
}: NearbyCampsitesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const [activeTab, setActiveTab] = useState<'interactive' | 'google'>('interactive');
  const [nearbyList, setNearbyList] = useState<CampsiteWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampsiteId, setSelectedCampsiteId] = useState<string | null>(null);

  const curLat = Number(currentCampsite.latitude);
  const curLon = Number(currentCampsite.longitude);
  const hasValidCoords = !isNaN(curLat) && !isNaN(curLon) && curLat !== 0 && curLon !== 0;

  // 1. Fetch all campsites and compute distances
  useEffect(() => {
    let isMounted = true;

    async function loadCampsites() {
      try {
        const all = await fetchActiveCampsites();
        if (!isMounted) return;

        const mapped: CampsiteWithDistance[] = [];

        if (Array.isArray(all)) {
          all.forEach((c: any) => {
            const lat = Number(c.latitude);
            const lon = Number(c.longitude);
            if (isNaN(lat) || isNaN(lon) || (lat === 0 && lon === 0)) return;

            const isCurrent =
              c.id === currentCampsite.id ||
              (c.slug && currentCampsite.slug && c.slug === currentCampsite.slug);

            const dist = hasValidCoords
              ? calculateHaversineKm(curLat, curLon, lat, lon)
              : 0;

            mapped.push({
              id: c.id,
              name: c.name,
              slug: c.slug,
              address: c.address,
              city: c.city,
              province: c.province,
              latitude: lat,
              longitude: lon,
              photos: c.photos,
              images: c.images,
              distanceKm: dist,
              isCurrent,
            });
          });
        }

        // Sort by distance (current first, then closest)
        mapped.sort((a, b) => {
          if (a.isCurrent) return -1;
          if (b.isCurrent) return 1;
          return a.distanceKm - b.distanceKm;
        });

        setNearbyList(mapped);
      } catch (err) {
        console.error('Failed to load nearby campsites:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCampsites();
    return () => {
      isMounted = false;
    };
  }, [currentCampsite.id, currentCampsite.slug, curLat, curLon, hasValidCoords]);

  // 2. Initialize Leaflet Map (client-side only)
  useEffect(() => {
    if (activeTab !== 'interactive') return;
    if (!mapContainerRef.current || !hasValidCoords) return;

    let isDestroyed = false;

    async function initLeaflet() {
      const L = (await import('leaflet')).default;
      if (isDestroyed || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [curLat, curLon],
        zoom: 12,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Tile layer: CartoDB Voyager (clean, modern travel style)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        },
      ).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>')
        .addTo(map);

      const markersMap: Record<string, any> = {};
      const boundsLatLngs: [number, number][] = [[curLat, curLon]];

      // Add pins for current and nearby campsites
      nearbyList.forEach((camp) => {
        const isCur = camp.isCurrent;
        boundsLatLngs.push([camp.latitude, camp.longitude]);

        // Custom HTML Marker Icon
        const iconHtml = isCur
          ? `
            <div class="relative flex flex-col items-center group cursor-pointer z-50">
              <div class="bg-brand-blue text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-brand-lime flex items-center gap-1.5 whitespace-nowrap transition-transform duration-200 group-hover:scale-110">
                <span class="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></span>
                <span>${camp.name}</span>
              </div>
              <div class="w-2.5 h-2.5 bg-brand-blue border-r-2 border-b-2 border-brand-lime transform rotate-45 -mt-1.5 shadow-xs"></div>
            </div>
          `
          : `
            <div class="relative flex flex-col items-center group cursor-pointer">
              <div class="bg-white text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md border border-brand-blue/30 hover:border-brand-blue flex items-center gap-1.5 whitespace-nowrap transition-transform duration-200 group-hover:scale-110">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                <span>${camp.name}</span>
                <span class="text-[9px] text-foreground-muted font-normal">(${camp.distanceKm.toFixed(0)} km)</span>
              </div>
              <div class="w-2 h-2 bg-white border-r border-b border-brand-blue/30 transform rotate-45 -mt-1"></div>
            </div>
          `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'embun-map-custom-marker',
          iconSize: [120, 36],
          iconAnchor: [60, 36],
          popupAnchor: [0, -36],
        });

        // Resolve photo for popup
        const photoUrl =
          camp.photos?.[0]?.url ||
          camp.images?.[0] ||
          '';
        const resolvedPhoto = photoUrl ? resolveAssetUrl(photoUrl) : '';

        // Popup HTML
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-xs space-y-2 text-foreground font-sans max-w-[220px]';
        popupContent.innerHTML = `
          ${
            resolvedPhoto
              ? `<div class="w-full h-24 rounded-xl overflow-hidden bg-surface mb-1.5">
                   <img src="${resolvedPhoto}" alt="${camp.name}" class="w-full h-full object-cover" />
                 </div>`
              : ''
          }
          <div class="space-y-0.5">
            <div class="flex items-center gap-1 font-bold text-sm text-foreground">
              <span>${camp.name}</span>
              ${isCur ? '<span class="text-[10px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded font-bold uppercase">Di Sini</span>' : ''}
            </div>
            <p class="text-[11px] text-foreground-muted truncate">
              ${camp.city || camp.address || 'Indonesia'}
            </p>
            ${
              !isCur
                ? `<p class="text-[11px] font-semibold text-brand-blue">
                     📍 Sekitar ${camp.distanceKm.toFixed(1)} km dari ${currentCampsite.name}
                   </p>`
                : ''
            }
          </div>
          ${
            !isCur
              ? `<a href="/campsite/${camp.slug || camp.id}" class="mt-2 block w-full text-center py-1.5 px-3 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-brand-blue-hover transition-colors shadow-2xs">
                   Lihat Kawasan
                 </a>`
              : ''
          }
        `;

        const marker = L.marker([camp.latitude, camp.longitude], {
          icon: customIcon,
          zIndexOffset: isCur ? 1000 : 100,
        }).addTo(map);

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: 'embun-leaflet-popup',
        });

        marker.on('click', () => {
          setSelectedCampsiteId(camp.id);
        });

        markersMap[camp.id] = marker;
      });

      markersRef.current = markersMap;

      // Fit bounds if multiple points, or center on current
      if (boundsLatLngs.length > 1) {
        map.fitBounds(boundsLatLngs, {
          padding: [50, 50],
          maxZoom: 13,
        });
      }
    }

    initLeaflet();

    return () => {
      isDestroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, curLat, curLon, hasValidCoords, nearbyList, currentCampsite.name]);

  // Handler to focus on a nearby campsite
  const handleFocusCampsite = (camp: CampsiteWithDistance) => {
    setSelectedCampsiteId(camp.id);
    setActiveTab('interactive');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([camp.latitude, camp.longitude], 14, {
        duration: 1.2,
      });
      const marker = markersRef.current[camp.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const otherCampsites = useMemo(
    () => nearbyList.filter((c) => !c.isCurrent),
    [nearbyList],
  );

  return (
    <div className="space-y-4">
      {/* Tab Switcher & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-brand-blue text-white shadow-2xs'
                : 'text-foreground hover:text-brand-blue'
            }`}
          >
            <Compass size={13} />
            <span>
              {lang === 'en' ? 'Embun Partner Map' : 'Peta Mitra Embun Sekitar'}
            </span>
            {otherCampsites.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'interactive'
                    ? 'bg-brand-lime text-black'
                    : 'bg-brand-blue/10 text-brand-blue'
                }`}
              >
                +{otherCampsites.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'google'
                ? 'bg-brand-blue text-white shadow-2xs'
                : 'text-foreground hover:text-brand-blue'
            }`}
          >
            <Navigation size={13} />
            <span>Google Maps</span>
          </button>
        </div>

        {/* Direct Google Maps Link */}
        {hasValidCoords && (
          <a
            href={
              currentCampsite.googleMapsUrl ||
              `https://www.google.com/maps/search/?api=1&query=${curLat},${curLon}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-brand-blue underline decoration-foreground/30 transition-colors"
          >
            <span>{lang === 'en' ? 'Open in Google Maps' : 'Buka di Aplikasi Maps'}</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Map Display Container */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[340px] w-full rounded-3xl overflow-hidden border border-border bg-surface shadow-2xs">
        {activeTab === 'interactive' ? (
          <>
            <div
              ref={mapContainerRef}
              className="w-full h-full z-0 focus:outline-hidden"
              style={{ minHeight: '340px' }}
            />
            {/* Top Badge: Partner Info */}
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-2 pointer-events-none">
              <MapPin size={13} className="text-brand-lime shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">
                {currentCampsite.name}
              </span>
              {otherCampsites.length > 0 && (
                <span className="text-[10px] text-brand-lime font-normal pl-1 border-l border-white/20">
                  {otherCampsites.length} Mitra Sekitar
                </span>
              )}
            </div>
          </>
        ) : (
          /* Google Maps Iframe */
          <div className="w-full h-full relative">
            <iframe
              width="100%"
              height="100%"
              className="w-full h-full border-0"
              loading="lazy"
              title={`Peta Google Maps ${currentCampsite.name}`}
              src={`https://maps.google.com/maps?q=${curLat},${curLon}&hl=${lang === 'en' ? 'en' : 'id'}&z=15&output=embed`}
            />
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1.5 pointer-events-none">
              <MapPin size={13} className="text-brand-lime" />
              <span>{currentCampsite.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── LIST MITRA EMUN LAIN DI SEKITAR SINI ── */}
      {otherCampsites.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <span>🏕️</span>
                <span>
                  {lang === 'en'
                    ? 'Other Embun Partners Around This Area'
                    : 'Mitra Embun Lain di Kawasan Ini'}
                </span>
              </h5>
              <p className="text-xs text-foreground-muted">
                {lang === 'en'
                  ? 'Discover more verified campsites partnered with Embun in the same region'
                  : 'Pilihan camping & glamping lain yang sudah bergabung dengan Embun di wilayah ini'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherCampsites.map((c) => {
              const photo = c.photos?.[0]?.url || c.images?.[0] || '';
              const resolved = photo ? resolveAssetUrl(photo) : '';
              const isSelected = selectedCampsiteId === c.id;

              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border transition-all bg-surface hover:border-brand-blue/60 group flex flex-col justify-between space-y-3 ${
                    isSelected ? 'border-brand-blue ring-2 ring-brand-blue/20 bg-brand-blue/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-dark/10 shrink-0 relative">
                      {resolved ? (
                        <img
                          src={resolved}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                          <MapPin size={20} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h6 className="font-bold text-xs text-foreground truncate group-hover:text-brand-blue transition-colors">
                        {c.name}
                      </h6>
                      <p className="text-[11px] text-foreground-muted truncate">
                        {c.city || c.address || 'Jawa Barat'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full">
                        <Compass size={10} />
                        <span>~{c.distanceKm.toFixed(1)} km</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-xs">
                    <button
                      type="button"
                      onClick={() => handleFocusCampsite(c)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl border border-border hover:bg-surface text-foreground font-semibold text-center text-[11px] cursor-pointer transition-colors"
                    >
                      {lang === 'en' ? 'View on Map' : 'Lihat di Peta'}
                    </button>
                    <Link
                      href={`/campsite/${c.slug || c.id}`}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-center text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <span>{lang === 'en' ? 'Explore' : 'Buka'}</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
