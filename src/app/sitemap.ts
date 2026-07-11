import { db } from '@/lib/db';
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.labellatavola.it';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/eventi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Aggiungi le pagine delle policy personalizzate se configurate
  try {
    const companyData = await db.companyData.findFirst({
      select: { privacyUrl: true, cookiesUrl: true },
    });
    if (companyData?.privacyUrl && companyData.privacyUrl !== '/privacy') {
      staticPages.push({
        url: `${BASE_URL}${companyData.privacyUrl}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      });
    }
    if (companyData?.cookiesUrl && companyData.cookiesUrl !== '/cookie-policy') {
      staticPages.push({
        url: `${BASE_URL}${companyData.cookiesUrl}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      });
    }
  } catch {
    // DB non disponibile — restituisci solo le pagine statiche
  }

  return staticPages;
}