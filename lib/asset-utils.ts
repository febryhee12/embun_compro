export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.embun.app/api';

export function resolveAssetUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const cleanKey = trimmed.replace(/^\/+/, '');
  if (
    cleanKey.startsWith('campsites/') ||
    cleanKey.startsWith('blocks/') ||
    cleanKey.startsWith('photos/') ||
    cleanKey.startsWith('panoramas/') ||
    cleanKey.startsWith('partners/')
  ) {
    return `https://media-staging.embun.app/${cleanKey}`;
  }
  const cleanPath = `/${cleanKey}`;
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${host}${cleanPath}`;
}

export const rupiah = (val?: number | string | null) => {
  if (val == null || val === '') return 'Rp0';
  const n = Number(val);
  if (isNaN(n)) return 'Rp0';
  return `Rp ${n.toLocaleString('id-ID')}`;
};

export function getCampsiteCoverCandidates(camp: any): string[] {
  if (!camp) return [];
  const candidates: string[] = [];

  if (camp.coverImageUrl && typeof camp.coverImageUrl === 'string' && camp.coverImageUrl.trim()) {
    candidates.push(camp.coverImageUrl.trim());
  }
  if (camp.mainImage && typeof camp.mainImage === 'string' && camp.mainImage.trim()) {
    candidates.push(camp.mainImage.trim());
  }

  // 1. Check official campsite.photos first (category: 'home' > 'view' > 'camping_ground')
  if (Array.isArray(camp.photos) && camp.photos.length > 0) {
    const scored: Array<{ url: string; score: number }> = [];
    camp.photos.forEach((p: any) => {
      const u = (p?.url || '').trim();
      if (u) {
        const cat = (p.category || '').toLowerCase();
        let score = 50;
        if (cat === 'home' || cat === 'cover' || cat === 'main') {
          score = 1;
        } else if (
          cat.includes('view') ||
          cat.includes('pemandangan') ||
          cat.includes('alam')
        ) {
          score = 2;
        } else if (
          cat.includes('camping_ground') ||
          cat.includes('ground') ||
          cat.includes('outdoor')
        ) {
          score = 3;
        } else if (
          cat.includes('toilet') ||
          cat.includes('wc') ||
          cat.includes('mandi')
        ) {
          score = 99;
        }
        scored.push({ url: u, score });
      }
    });

    if (scored.length > 0) {
      scored.sort((a, b) => a.score - b.score);
      scored.forEach((item) => {
        if (item.score < 99 && !candidates.includes(item.url)) {
          candidates.push(item.url);
        }
      });
    }
  }

  // 2. Fallback to block photos if campsite photos are empty or fail
  if (Array.isArray(camp.blocks) && camp.blocks.length > 0) {
    const scored: Array<{ url: string; score: number }> = [];
    camp.blocks.forEach((b: any) => {
      if (Array.isArray(b.photos)) {
        b.photos.forEach((p: any) => {
          const u = (p?.url || '').trim();
          if (u) {
            const cat = (p.category || '').toLowerCase();
            let score = 50;
            if (
              cat.includes('mandi') ||
              cat.includes('toilet') ||
              cat.includes('wc')
            ) {
              score = 99;
            } else if (
              cat.includes('luar') ||
              cat.includes('pemandangan') ||
              cat.includes('view') ||
              cat.includes('alam')
            ) {
              score = 1;
            } else if (
              cat.includes('utama') ||
              cat.includes('tenda') ||
              cat.includes('kamar')
            ) {
              score = 2;
            }
            scored.push({ url: u, score });
          }
        });
      }
      if (Array.isArray(b.images)) {
        b.images.forEach((img: string) => {
          const u = (img || '').trim();
          if (u) scored.push({ url: u, score: 50 });
        });
      }
    });
    if (scored.length > 0) {
      scored.sort((a, b) => a.score - b.score);
      scored.forEach((item) => {
        if (item.score < 99 && !candidates.includes(item.url)) {
          candidates.push(item.url);
        }
      });
    }
  }

  if (
    camp.mapImageUrl &&
    typeof camp.mapImageUrl === 'string' &&
    camp.mapImageUrl.trim() &&
    !candidates.includes(camp.mapImageUrl.trim())
  ) {
    candidates.push(camp.mapImageUrl.trim());
  }

  return candidates;
}

export function getCampsiteCoverPhoto(camp: any): string {
  const candidates = getCampsiteCoverCandidates(camp);
  return candidates[0] || '';
}
