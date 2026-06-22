interface CookieConsent {
  accepted: boolean;
  date: string;
  tecnici: boolean;
  analitici: boolean;
  marketing: boolean;
}

declare global {
  interface Window {
    __cookieConsent: CookieConsent | null;
  }
  interface WindowEventMap {
    'cookie-consent-change': CustomEvent<CookieConsent>;
  }
}

export {};