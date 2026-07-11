'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';

interface SiteInfo {
  heroTitle: string;
  heroSubtitle: string;
  heroCTAText: string;
  heroImageUrl: string | null;
  heroOverlayOpacity: number;
}

interface SiteImage {
  id: string;
  url: string;
  titolo: string | null;
  ordine: number;
}

export default function Hero() {
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [heroImages, setHeroImages] = useState<SiteImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then(setSiteInfo)
      .catch(() => {});
    fetch('/api/site-images?sezione=hero')
      .then((r) => r.json())
      .then((imgs) => { if (imgs.length > 0) setHeroImages(imgs); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (siteInfo) {
      dbTr.register({
        'hero.title': siteInfo.heroTitle,
        'hero.subtitle': siteInfo.heroSubtitle,
        'hero.cta': siteInfo.heroCTAText,
        'hero.slogan': (siteInfo as any).slogan,
      });
    }
  }, [siteInfo]);

  // Auto-rotate slideshow if multiple hero images
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const scrollToPrenota = () => {
    document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMenu = () => {
    window.location.href = '/menu';
  };

  const bgImage = heroImages.length > 0
    ? heroImages[currentSlide]?.url
    : siteInfo?.heroImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';

  const overlayOpacity = siteInfo?.heroOverlayOpacity ?? 0.5;

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with slideshow */}
      {heroImages.length > 1 ? (
        heroImages.map((img, i) => (
          <div
            key={img.id}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${img.url})`,
              opacity: i === currentSlide ? 1 : 0,
              zIndex: i === currentSlide ? 1 : 0,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
              style={{ opacity: overlayOpacity / 0.5 * 0.7 }}
            />
          </div>
        ))
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
            style={{ opacity: overlayOpacity / 0.5 * 0.7 }}
          />
        </div>
      )}

      {/* Slide indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="space-y-6 animate-in fade-in duration-1000">
          <div className="inline-block">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium">
              {t('hero.badge')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            {dbTr.t('hero.title', siteInfo?.heroTitle) || t('hero.defaultTitle')}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {dbTr.t('hero.subtitle', siteInfo?.heroSubtitle) || t('hero.defaultSubtitle')}
          </p>

          {/* CTA buttons — sospesi */}
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={scrollToPrenota}
              className="text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-[var(--primary)] hover:opacity-90"
            >
              {dbTr.t('hero.cta', siteInfo?.heroCTAText) || t('hero.defaultCTA')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToMenu}
              className="border-white/40 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full backdrop-blur-sm hover:scale-105 transition-all"
            >
              {t('hero.scopriMenu')}
            </Button>
          </div> */}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <button
          onClick={scrollToMenu}
          className="text-white/60 hover:text-white transition-colors"
          aria-label={t('hero.scrollDown')}
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}