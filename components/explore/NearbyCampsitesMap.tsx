'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
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

const MAP_I18N = {
  id: {
    partnerMap: 'Peta Mitra Embun Sekitar',
    googleMaps: 'Google Maps',
    nearbyPartnersBadge: (count: number) => `${count} Mitra Sekitar`,
    currentLocationBadge: 'Lokasi Ini',
    approxDistance: (dist: string, campName: string) =>
      `~${dist} km dari ${campName}`,
    exploreArea: 'Lihat Kawasan',
    sectionTitle: 'Mitra Embun Lain di Kawasan Ini',
    sectionSubtitle:
      'Pilihan camping & glamping lain yang sudah bergabung dengan Embun di wilayah ini',
    viewOnMap: 'Lihat di Peta',
    open: 'Buka',
    defaultLocation: 'Indonesia',
  },
  en: {
    partnerMap: 'Nearby Embun Partners',
    googleMaps: 'Google Maps',
    nearbyPartnersBadge: (count: number) => `${count} Nearby Partners`,
    currentLocationBadge: 'Current Location',
    approxDistance: (dist: string, campName: string) =>
      `~${dist} km from ${campName}`,
    exploreArea: 'Explore Area',
    sectionTitle: 'Other Embun Partners in This Area',
    sectionSubtitle:
      'Other camping & glamping spots partnered with Embun in this region',
    viewOnMap: 'View on Map',
    open: 'Explore',
    defaultLocation: 'Indonesia',
  },
};

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
  const t = MAP_I18N[lang] || MAP_I18N.id;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const [activeTab, setActiveTab] = useState<'google' | 'interactive'>('google');
  const [nearbyList, setNearbyList] = useState<CampsiteWithDistance[]>([]);
  const [selectedCampsiteId, setSelectedCampsiteId] = useState<string | null>(null);

  const curLat = Number(currentCampsite.latitude);
  const curLon = Number(currentCampsite.longitude);
  const hasValidCoords =
    !isNaN(curLat) && !isNaN(curLon) && curLat !== 0 && curLon !== 0;

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
              (c.slug &&
                currentCampsite.slug &&
                c.slug === currentCampsite.slug);

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

      // Tile layer: Google Maps Tiles (clean, familiar, fast, no watermark)
      L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          subdomains: ['0', '1', '2', '3'],
        },
      ).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; Google Maps')
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
              <div class="bg-white dark:bg-[#0e1117] text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md border border-brand-blue/30 dark:border-brand-lime/40 hover:border-brand-blue dark:hover:border-brand-lime flex items-center gap-1.5 whitespace-nowrap transition-transform duration-200 group-hover:scale-110">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-lime"></span>
                <span>${camp.name}</span>
                <span class="text-[9px] text-foreground-muted font-normal">(${camp.distanceKm.toFixed(0)} km)</span>
              </div>
              <div class="w-2 h-2 bg-white dark:bg-[#0e1117] border-r border-b border-brand-blue/30 dark:border-brand-lime/40 transform rotate-45 -mt-1"></div>
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

        // Popup HTML with high-contrast readable button & proportional layout
        const popupContent = document.createElement('div');
        popupContent.className = 'text-xs text-foreground font-sans space-y-2.5';
        popupContent.innerHTML = `
          ${
            resolvedPhoto
              ? `<div class="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface shadow-2xs">
                   <img src="${resolvedPhoto}" alt="${camp.name}" class="w-full h-full object-cover" />
                 </div>`
              : ''
          }
          <div class="space-y-1 px-0.5">
            <div class="flex items-center justify-between gap-1.5">
              <h6 class="font-bold text-sm text-foreground tracking-tight truncate">${camp.name}</h6>
              ${
                isCur
                  ? `<span class="text-[10px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold uppercase shrink-0">${t.currentLocationBadge}</span>`
                  : ''
              }
            </div>
            <p class="text-[11px] font-medium text-foreground-muted truncate">
              ${camp.city || camp.address || t.defaultLocation}
            </p>
            ${
              !isCur
                ? `<div class="pt-1">
                     <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-blue/10 dark:bg-brand-lime/15 text-brand-blue dark:text-brand-lime font-bold text-[10px]">
                       <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                         <circle cx="12" cy="12" r="10"></circle>
                         <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                       </svg>
                       <span>${t.approxDistance(camp.distanceKm.toFixed(1), currentCampsite.name)}</span>
                     </div>
                   </div>`
                : ''
            }
          </div>
          ${
            !isCur
              ? `<a href="/campsite/${camp.slug || camp.id}" class="embun-popup-btn mt-2">
                   <span>${t.exploreArea}</span>
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
  }, [
    activeTab,
    curLat,
    curLon,
    hasValidCoords,
    nearbyList,
    currentCampsite.name,
    lang,
    t,
  ]);

  const otherCampsites = useMemo(
    () => nearbyList.filter((c) => !c.isCurrent),
    [nearbyList],
  );

  return (
    <div className="space-y-4">
      {/* Tab Switcher (Google Maps first, then Peta Mitra Embun Sekitar) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'google'
                ? 'bg-brand-blue dark:bg-brand-lime text-white dark:text-black shadow-2xs font-bold dark:font-black'
                : 'text-foreground-muted hover:text-foreground dark:hover:text-brand-lime'
            }`}
          >
            <Navigation size={13} />
            <span>{t.googleMaps}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-brand-blue dark:bg-brand-lime text-white dark:text-black shadow-2xs font-bold dark:font-black'
                : 'text-foreground-muted hover:text-foreground dark:hover:text-brand-lime'
            }`}
          >
            <Compass size={13} />
            <span>{t.partnerMap}</span>
            {otherCampsites.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'interactive'
                    ? 'bg-brand-lime dark:bg-black text-black dark:text-brand-lime'
                    : 'bg-brand-blue/10 dark:bg-brand-lime/15 text-brand-blue dark:text-brand-lime'
                }`}
              >
                +{otherCampsites.length}
              </span>
            )}
          </button>
        </div>
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
            {/* Top Badge: Current Campsite Info */}
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-2 pointer-events-none">
              <MapPin size={13} className="text-brand-lime shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">
                {currentCampsite.name}
              </span>
              {otherCampsites.length > 0 && (
                <span className="text-[10px] text-brand-lime font-normal pl-1 border-l border-white/20">
                  {t.nearbyPartnersBadge(otherCampsites.length)}
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
    </div>
  );
}
