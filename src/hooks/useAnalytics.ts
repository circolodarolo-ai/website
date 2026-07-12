'use client';

import { useEffect, useRef, useState } from 'react';

function getSessionId(): string {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return '';
  try {
    let sid = sessionStorage.getItem('_analytics_sid');
    if (!sid) {
      sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('_analytics_sid', sid);
    }
    return sid;
  } catch {
    return '';
  }
}

function fingerprintHash(): string {
  try {
    if (typeof navigator === 'undefined' || typeof screen === 'undefined') return 'unknown';
    const nav = navigator as Record<string, unknown>;
    const str = [
      nav.language,
      (nav.hardwareConcurrency || 0),
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  } catch {
    return 'unknown';
  }
}

function trackPageView(sessionId: string, ipHash: string) {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    fetch('/api/analytics-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventType: 'pageview',
        pageUrl: window.location.pathname,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        ipHash,
      }),
    }).catch(() => {});
  } catch {}
}

export function useAnalyticsTracking() {
  const tracked = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionId = getSessionId();
    const ipHash = fingerprintHash();

    const tryTrack = () => {
      try {
        if (tracked.current) return;
        const consent = (window as any).__cookieConsent;
        if (!consent?.analitici) return;
        tracked.current = true;
        trackPageView(sessionId, ipHash);

        const startTime = Date.now();
        const handleUnload = () => {
          const duration = Math.round((Date.now() - startTime) / 1000);
          if (duration < 2) return;
          try {
            const payload = JSON.stringify({
              sessionId,
              eventType: 'session_end',
              pageUrl: window.location.pathname,
              duration,
              ipHash,
            });
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              navigator.sendBeacon('/api/analytics-track', payload);
            }
          } catch {}
        };
        window.addEventListener('beforeunload', handleUnload);
      } catch {}
    };

    tryTrack();

    const handleConsentChange = () => { tryTrack(); };
    try {
      window.addEventListener('cookie-consent-change', handleConsentChange);
      return () => {
        try { window.removeEventListener('cookie-consent-change', handleConsentChange); } catch {}
      };
    } catch {
      return;
    }
  }, []);
}

export function useMarketingConsent(): boolean {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => {
      try {
        const c = (window as any).__cookieConsent;
        setConsent(c?.marketing === true);
      } catch {}
    };
    check();

    const handle = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        setConsent(detail?.marketing === true);
      } catch {}
    };
    try {
      window.addEventListener('cookie-consent-change', handle);
      return () => { try { window.removeEventListener('cookie-consent-change', handle); } catch {} };
    } catch {
      return;
    }
  }, []);

  return consent;
}