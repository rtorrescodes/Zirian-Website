import { getScoutingReport, uploadScoutingPhoto, updateTaskStatus } from '@/app/actions/field';
import { CameraUploader } from '@/components/tecnico/camera-uploader';
import { MapPin, User, FileText, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ScoutingDetailPage({ params }: { params: { id: string } }) {
  const reportId = parseInt(params.id, 10);
  const report = await getScoutingReport(reportId);

  if (!report) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-brand-cyan text-brand-cyan">Scouting</Badge>
          <span className="text-xs font-semibold text-muted-foreground">{report.status}</span>
        </div>
        
        <h1 className="mt-3 text-xl font-bold text-foreground">{report.client.nombre}</h1>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
            <span className="flex-1">{report.client.ubicacion || 'Sin dirección registrada'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
            <span className="flex-1">{report.client.telefono}</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
            <span className="flex-1">{report.notas || 'Sin notas especiales'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Evidencia Fotográfica</h2>
        
        <CameraUploader 
          taskId={report.id} 
          taskType="scouting" 
          onUploadAction={uploadScoutingPhoto} 
        />
        
        {report.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {report.photos.map((photo) => (
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

      {report.status !== 'Completado' && (
        <form action={async () => {
          'use server';
          await updateTaskStatus(report.id, 'scouting', 'Completado');
        }}>
          <Button type="submit" className="h-14 w-full rounded-xl bg-brand-green text-lg font-bold hover:bg-brand-green/90">
            <CheckCircle2 className="mr-2 h-6 w-6" />
            Finalizar Scouting
          </Button>
        </form>
      )}
    </div>
  );
}
