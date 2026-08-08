export const dynamic = 'force-dynamic';

import CCTVMap from '@/components/cctv/CCTVMap';

export default function CCTVDesignerPage() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <CCTVMap />
    </div>
  );
}
