export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CCTVMap from '@/components/cctv/CCTVMap';

export default function CCTVDesignerPage() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <Suspense fallback={<div className="text-white p-8">Cargando diseñador...</div>}>
        <CCTVMap />
      </Suspense>
    </div>
  );
}
