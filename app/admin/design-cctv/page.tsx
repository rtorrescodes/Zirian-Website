export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CCTVMap from '@/components/cctv/CCTVMap';

export default function CCTVDesignerPage() {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black z-50">
      <Suspense fallback={<div className="text-white p-8">Cargando diseñador...</div>}>
        <CCTVMap />
      </Suspense>
    </div>
  );
}
