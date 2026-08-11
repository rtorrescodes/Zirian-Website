import { getServiceOrder, uploadInstallationPhoto, updateTaskStatus } from '@/app/actions/field';
import { CameraUploader } from '@/components/tecnico/camera-uploader';
import { MapPin, User, FileText, CheckCircle2, Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10);
  const order = await getServiceOrder(orderId);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-brand-green text-brand-green">Instalación</Badge>
          <span className="text-xs font-semibold text-muted-foreground">{order.status}</span>
        </div>
        
        <h1 className="mt-3 text-xl font-bold text-foreground">{order.quote?.client?.nombre}</h1>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
            <span className="flex-1">{order.quote?.client?.ubicacion || 'Sin dirección registrada'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
            <span className="flex-1">{order.quote?.client?.telefono}</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
            <span className="flex-1">{order.notas_internas || 'Sin notas especiales'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          Equipos a Instalar
        </h2>
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {order.quote?.items?.map((item) => (
            <li key={item.id} className="p-3 text-sm flex justify-between">
              <span className="font-medium">{item.descripcion}</span>
              <span className="text-muted-foreground font-semibold">x{Number(item.cantidad)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Evidencia Fotográfica</h2>
        
        <CameraUploader 
          taskId={order.id} 
          taskType="installation" 
          onUploadAction={uploadInstallationPhoto} 
        />
        
        {order.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {order.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-black/5 border border-border">
                <img src={photo.url} alt={photo.descripcion || 'Foto'} className="h-full w-full object-cover" />
                {photo.descripcion && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 text-[10px] text-white">
                    {photo.descripcion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {order.status !== 'Completada' && (
        <form action={async () => {
          'use server';
          await updateTaskStatus(order.id, 'installation', 'Completada');
        }}>
          <Button type="submit" className="h-14 w-full rounded-xl bg-brand-green text-lg font-bold hover:bg-brand-green/90">
            <CheckCircle2 className="mr-2 h-6 w-6" />
            Finalizar Instalación
          </Button>
        </form>
      )}
    </div>
  );
}
