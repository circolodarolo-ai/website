'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SiteInfo {
  heroTitle: string;
  heroSubtitle: string;
  heroCTAText: string;
  primaryColor?: string;
}

export default function Hero() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then(setSiteInfo)
      .catch(() => {});
  }, []);

  const scrollToPrenota = () => {
    document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="space-y-6 animate-in fade-in duration-1000">
          <div className="inline-block">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium">
              Dal 1985 nel cuore di Milano
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            {siteInfo?.heroTitle || 'Autentica Cucina Italiana'}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {siteInfo?.heroSubtitle || 'Tradizione, passione e sapori genuini'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={scrollToPrenota}
              className="bg-red-700 hover:bg-red-800 text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              {siteInfo?.heroCTAText || 'Prenota un Tavolo'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToMenu}
              className="border-white/40 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full backdrop-blur-sm hover:scale-105 transition-all"
            >
              Scopri il Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button
          onClick={scrollToMenu}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Scorri verso il basso"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}