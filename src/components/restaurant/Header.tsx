'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Phone, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '@/lib/i18n-context';

interface SiteInfo {
  nomeLocale: string;
  telefono: string;
  prenotazioniAttive: boolean;
  logoUrl: string | null;
  headerTextColor: string | null;
}

export default function Header() {
  const { t } = useI18n();
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const headerTextColor = siteInfo?.headerTextColor || '#ffffff';
  const navLinks = [
    { label: t('nav.home'), href: '/', anchor: null as string | null },
    { label: t('nav.menu'), href: '/menu', anchor: null as string | null },
    { label: t('nav.eventi'), href: '/eventi', anchor: null as string | null },
    { label: t('nav.chiSiamo'), href: '/', anchor: '#chisiamo' },
    { label: t('nav.contatti'), href: '/', anchor: '#contatti' },
  ];

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then(setSiteInfo)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (href: string, anchor: string | null) => {
    setSheetOpen(false);
    const isHomePage = pathname === '/';
    // Same page: scroll to anchor or top
    if (isHomePage && (href === '/' || href === '')) {
      if (anchor) {
        const el = document.querySelector(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Different page: navigate
    if (anchor) {
      // Cross-page anchor: full navigation for reliable scroll
      window.location.href = href + anchor;
    } else {
      router.push(href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setSheetOpen(false);
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                router.push('/');
              }
            }}
            className="flex items-center gap-2 group"
          >
            {siteInfo?.logoUrl ? (
              <img
                src={siteInfo.logoUrl}
                alt={siteInfo.nomeLocale || 'Logo'}
                className={`h-10 w-auto object-contain transition-all group-hover:scale-105 ${scrolled ? '' : 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'}`}
              />
            ) : (
              <UtensilsCrossed
                className={`h-7 w-7 transition-colors ${scrolled ? 'text-[var(--primary)]' : ''}`}
                style={!scrolled ? { color: headerTextColor } : undefined}
              />
            )}
            <span
              className={`text-xl font-bold tracking-tight transition-colors ${
                scrolled ? 'text-[var(--primary)]' : ''
              }`}
              style={!scrolled ? { color: headerTextColor } : undefined}
            >
              {siteInfo?.nomeLocale || 'La Bella Tavola'}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href, link.anchor)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                  scrolled
                    ? 'text-gray-700 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5'
                    : ''
                }`}
                style={!scrolled ? { color: headerTextColor } : undefined}
              >
                {link.label}
              </button>
            ))}
            {siteInfo?.prenotazioniAttive !== false && (
            <Button
              size="sm"
              onClick={() => handleNav('/', '#prenota')}
              className="ml-2 text-white rounded-full px-5"
              style={{ backgroundColor: 'var(--prenota-btn-color)' }}
            >
              {t('nav.prenota')}
            </Button>
            )}
            <div className="ml-2">
              <LanguageSelector />
            </div>
          </nav>

          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            {siteInfo?.telefono && (
              <a
                href={`tel:${siteInfo.telefono}`}
                className={`p-2 rounded-full ${scrolled ? 'text-[var(--primary)]' : ''}`}
                style={!scrolled ? { color: headerTextColor } : undefined}
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={scrolled ? 'text-gray-700' : ''}
                style={!scrolled ? { color: headerTextColor } : undefined}
                  suppressHydrationWarning
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <SheetTitle className="text-[var(--primary)] font-bold text-lg mb-6">
                  {t('nav.mobileMenu')}
                </SheetTitle>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNav(link.href, link.anchor)}
                      className="text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] font-medium transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                  {siteInfo?.prenotazioniAttive !== false && (
                  <Button
                    onClick={() => handleNav('/', '#prenota')}
                    className="mt-4 text-white rounded-full"
                    style={{ backgroundColor: 'var(--prenota-btn-color)' }}
                  >
                    {t('nav.prenotaTavolo')}
                  </Button>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <LanguageSelector />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}