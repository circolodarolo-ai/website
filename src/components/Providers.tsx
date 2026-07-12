'use client';

import { I18nProvider } from '@/lib/i18n-context';
import { useAnalyticsTracking } from '@/hooks/useAnalytics';
import ErrorBoundary from '@/components/ErrorBoundary';

function AnalyticsTracker() {
  useAnalyticsTracking();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AnalyticsTracker />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </I18nProvider>
    </ErrorBoundary>
  );
}