import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  
  const routes = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/mitra', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/mitra/direktori', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/kebijakan-privasi', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/syarat-ketentuan', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/kebijakan-refund', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  const languages = ['id', 'en'];
  
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const lang of languages) {
      sitemapEntries.push({
        url: `${SITE_URL}/${lang}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            id: `${SITE_URL}/id${route.path}`,
            en: `${SITE_URL}/en${route.path}`,
          },
        },
      });
    }
  }

  // Also include the root path which redirects
  sitemapEntries.push({
    url: `${SITE_URL}/`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  });

  return sitemapEntries;
}
