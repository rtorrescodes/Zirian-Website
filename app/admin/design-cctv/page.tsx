export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Suspense } from 'react';
import CCTVMap from '@/components/cctv/CCTVMap';

export const metadata: Metadata = {
  title: 'Zirian CCTV Designer | Modo Terreno',
  description: 'Diseñador profesional CCTV para levantamientos en campo con GPS y modo offline.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CCTV Zirian'
  }
};

export default function CCTVDesignerPage() {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black z-50">
      <Suspense fallback={<div className="text-white p-8 font-tech animate-pulse">Iniciando Diseñador CCTV...</div>}>
        <CCTVMap />
      </Suspense>
    </div>
  );
}
