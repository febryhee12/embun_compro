/**
 * Layanan On-Demand Translation Client-Side
 * Menggunakan in-memory cache agar request tidak berulang.
 * Mengikuti arsitektur Flutter mobile app Embun.
 */

const translationCache = new Map<string, string>();

export async function translateText(
  text: string,
  targetLang: 'en' | 'id' = 'en',
  sourceLang: 'id' | 'en' = 'id'
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (targetLang === sourceLang) return text;

  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Google Translate GTX Engine (Sangat natural dan cepat)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((sentence: any) => (sentence && sentence[0] ? sentence[0] : ''))
          .join('');
        if (translated && translated.trim()) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('Google Translate API error, attempting fallback:', err);
  }

  // 2. MyMemory Translation API Fallback
  try {
    const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(fallbackUrl);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && translated.trim()) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (err) {
    console.warn('MyMemory fallback translation error:', err);
  }

  // Fallback terakhir: kembalikan teks asli
  return text;
}

export async function translateItems(
  items: string[],
  targetLang: 'en' | 'id' = 'en',
  sourceLang: 'id' | 'en' = 'id'
): Promise<string[]> {
  if (!items || items.length === 0) return [];
  const joined = items.join('\n');
  const translated = await translateText(joined, targetLang, sourceLang);
  const result = translated
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  return result.length > 0 ? result : items;
}
