'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const AdminPanel = dynamic(() => import('./AdminPanel'), { ssr: false });

export default function AdminPanelLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      try {
        const btn = document.querySelector('[aria-label="Apri Pannello Admin"]') as HTMLButtonElement;
        if (btn) btn.click();
      } catch {}
    };
    try {
      window.addEventListener('open-admin-panel', handler);
      return () => { try { window.removeEventListener('open-admin-panel', handler); } catch {} };
    } catch {
      return;
    }
  }, []);

  return <AdminPanel />;
}