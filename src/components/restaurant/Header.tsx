'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Phone, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';

interface SiteInfo {
  nomeLocale: string;
  telefono: string;
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Menu', href: '/menu', isPage: true },
  { label: 'Eventi', href: '#eventi' },
  { label: 'Chi Siamo', href: '#chisiamo' },
  { label: 'Contatti', href: '#contatti' },
];

export default function Header() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);

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

  const handleNav = (href: string, isPage?: boolean) => {
    if (isPage) {
      window.location.href = href;
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNav('#home'); }}
            className="flex items-center gap-2 group"
          >
            <UtensilsCrossed
              className={`h-7 w-7 transition-colors ${scrolled ? 'text-red-700' : 'text-white'}`}
            />
            <span
              className={`text-xl font-bold tracking-tight transition-colors ${
                scrolled ? 'text-red-700' : 'text-white'
              }`}
            >
              {siteInfo?.nomeLocale || 'La Bella Tavola'}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isPage ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                    scrolled
                      ? 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                    scrolled
                      ? 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </button>
              )
            )}
            <Button
              size="sm"
              onClick={() => handleNav('#prenota')}
              className="ml-2 bg-red-700 hover:bg-red-800 text-white rounded-full px-5"
            >
              Prenota
            </Button>
          </nav>

          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            {siteInfo?.telefono && (
              <a
                href={`tel:${siteInfo.telefono}`}
                className={`p-2 rounded-full ${scrolled ? 'text-red-700' : 'text-white'}`}
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={scrolled ? 'text-gray-700' : 'text-white'}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <SheetTitle className="text-red-700 font-bold text-lg mb-6">
                  Menu
                </SheetTitle>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) =>
                    link.isPage ? (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        key={link.href}
                        onClick={() => handleNav(link.href)}
                        className="text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                      >
                        {link.label}
                      </button>
                    )
                  )}
                  <Button
                    onClick={() => handleNav('#prenota')}
                    className="mt-4 bg-red-700 hover:bg-red-800 text-white rounded-full"
                  >
                    Prenota un Tavolo
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}