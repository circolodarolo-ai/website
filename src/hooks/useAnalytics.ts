'use client';

import { useEffect, useRef, useState } from 'react';

// Generate or retrieve anonymous session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('_analytics_sid');
  if (!sid) {
    sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('_analytics_sid', sid);
  }
  return sid;
}

// Simple hash for IP (not real IP, just a fingerprint placeholder)
function fingerprintHash(): string {
  try {
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

// Track a single pageview
function trackPageView(sessionId: string, ipHash: string) {
  try {
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
    // Always register the consent-change listener FIRST,
    // even if consent hasn't been given yet.
    // Previously, the early return prevented the listener from ever being registered.
    const sessionId = getSessionId();
    const ipHash = fingerprintHash();

    const tryTrack = () => {
      if (tracked.current) return;
      const consent = window.__cookieConsent;
      if (!consent?.analitici) return;
      tracked.current = true;
      trackPageView(sessionId, ipHash);

      // Track duration on unload
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
          navigator.sendBeacon('/api/analytics-track', payload);
        } catch {}
      };
      window.addEventListener('beforeunload', handleUnload);
    };

    // Try tracking immediately (consent might already be set from localStorage)
    tryTrack();

    // Listen for consent changes (fires when user accepts cookies)
    const handleConsentChange = () => {
      tryTrack();
    };
    window.addEventListener('cookie-consent-change', handleConsentChange);

    return () => {
      window.removeEventListener('cookie-consent-change', handleConsentChange);
    };
  }, []);
}

// Hook to check if marketing cookies are accepted
export function useMarketingConsent(): boolean {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const check = () => {
      const c = window.__cookieConsent;
      setConsent(c?.marketing === true);
    };
    check();

    const handle = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setConsent(detail?.marketing === true);
    };
    window.addEventListener('cookie-consent-change', handle);
    return () => window.removeEventListener('cookie-consent-change', handle);
  }, []);

  return consent;
}