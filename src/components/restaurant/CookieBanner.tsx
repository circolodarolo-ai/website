'use client';

import { useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('cookie-consent');
  });

  const accept = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-6 w-6 text-red-700 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. 
            Cliccando su &quot;Autorizzo&quot;, accetti l&apos;uso dei cookie.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={decline}
            className="flex-1 sm:flex-initial rounded-full px-4"
          >
            Annulla
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="flex-1 sm:flex-initial bg-red-700 hover:bg-red-800 text-white rounded-full px-4"
          >
            Autorizzo
          </Button>
        </div>
      </div>
    </div>
  );
}