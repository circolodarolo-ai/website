'use client';

import dynamic from 'next/dynamic';

// AdminPanel loaded ONLY on demand (click) — avoids shipping ~600KB (recharts + 13 admin modules) to every visitor
const AdminPanel = dynamic(() => import('./AdminPanel'), { ssr: false });

export default function AdminPanelLoader() {
  return <AdminPanel />;
}