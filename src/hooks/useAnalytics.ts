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

export function useAnalyticsTracking() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    // Only track if analytics cookies are accepted
    const consent = window.__cookieConsent;
    if (!consent?.analitici) return;

    tracked.current = true;

    const sessionId = getSessionId();
    const ipHash = fingerprintHash();

    // Track page view
    const trackPageView = () => {
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
    };

    trackPageView();

    // Track duration on unload
    const startTime = Date.now();
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration < 2) return;
      try {
        // Use sendBeacon for reliable tracking on page leave
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

    // Listen for consent changes
    const handleConsentChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.analitici && !tracked.current) {
        tracked.current = true;
        trackPageView();
      }
    };
    window.addEventListener('cookie-consent-change', handleConsentChange);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
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

