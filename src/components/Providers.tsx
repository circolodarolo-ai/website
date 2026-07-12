'use client';

import { I18nProvider } from '@/lib/i18n-context';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';

function AnalyticsTracker() {
  useAnalyticsTracking();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AnalyticsTracker />
      {children}
    </I18nProvider>
  );
}