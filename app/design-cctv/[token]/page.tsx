export const dynamic = 'force-dynamic';

import CCTVMap from '@/components/cctv/CCTVMap';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function PublicCCTVDesignerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const project = await prisma.cctvProject.findUnique({
    where: { shareToken: token },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <CCTVMap clientMode={true} shareToken={token} />
    </div>
  );
}
