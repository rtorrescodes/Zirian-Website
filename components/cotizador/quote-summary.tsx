'use client';

import { Save, FileText, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuoteSummaryProps {
  items: any[];
  status: string;
  setStatus: (status: string) => void;
  requiereFactura: boolean;
  setRequiereFactura: (val: boolean) => void;
  mostrarDesglose: boolean;
  setMostrarDesglose: (val: boolean) => void;
  template: string;
  setTemplate: (val: string) => void;
  notasCliente: string;
  setNotasCliente: (val: string) => void;
  motivoRechazo: string;
  setMotivoRechazo: (val: string) => void;
  subtotal: number;
  subtotalCost: number;
  ganancia: number;
  iva: number;
  total: number;
  isSaving: boolean;
  isSaved: boolean;
  savedQuoteId: number | null;
  handleSave: () => void;
  handleViewPdf: () => void;
  selectedClient: any;
}

export function QuoteSummary({
  items,
  status,
  setStatus,
  requiereFactura,
  setRequiereFactura,
  mostrarDesglose,
  setMostrarDesglose,
  template,
  setTemplate,
  notasCliente,
  setNotasCliente,
  motivoRechazo,
  setMotivoRechazo,
  subtotal,
  ganancia,
  total,
  isSaving,
  isSaved,
  savedQuoteId,
  handleSave,
  handleViewPdf,
  selectedClient,
}: QuoteSummaryProps) {
  const currencyExact = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <div className="bg-slate-950 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:p-6 rounded-b-2xl border-t border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center space-x-2">
            <Switch
              id="mostrar-desglose"
              checked={mostrarDesglose}
              onCheckedChange={setMostrarDesglose}
              className="data-[state=checked]:bg-brand-cyan"
            />
            <Label htmlFor="mostrar-desglose" className="font-tech text-xs font-bold uppercase tracking-widest text-slate-400">
              Desglosar Precios en PDF
            </Label>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <Switch
              id="requiere-factura"
              checked={requiereFactura}
              onCheckedChange={setRequiereFactura}
              className="data-[state=checked]:bg-brand-blue"
            />
            <Label htmlFor="requiere-factura" className="font-tech text-xs font-bold uppercase tracking-widest text-slate-400">
              Incluir IVA (Requiere Factura)
            </Label>
          </div>

          <dl className="mt-4 border-t border-slate-800 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <dt className="font-tech text-sm font-bold uppercase tracking-widest text-white">
                Total
              </dt>
              <dd className="font-mono text-2xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                {currencyExact(total)}
              </dd>
            </div>
            {ganancia > 0 && (
              <div className="flex items-center justify-between">
                <dt className="font-tech text-[10px] font-bold uppercase tracking-widest text-orange-400/80">
                  Ganancia Estimada
                </dt>
                <dd className="font-mono text-sm font-bold text-orange-400/90 drop-shadow-[0_0_10px_rgba(251,146,60,0.2)]">
                  {currencyExact(ganancia)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Plantilla PDF</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
              >
                <option value="ev_charger">Cargadores EV</option>
                <option value="ev_charger_en">Cargadores EV (Inglés)</option>
                <option value="general">Cotización General (CCTV, etc)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800">
              <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Nota Técnica (Opcional)</label>
              <textarea
                value={notasCliente}
                onChange={(e) => setNotasCliente(e.target.value)}
                placeholder="Añade notas adicionales para el cliente..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue min-h-[60px]"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Estatus de Cotización</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
              >
                <option value="Borrador">Borrador</option>
                <option value="Enviada">Enviada</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Requiere Atención">Requiere Atención</option>
              </select>
            </div>

            {(status === 'Rechazada' || status === 'Cancelada') && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Motivo
                </label>
                <Textarea 
                  value={motivoRechazo}
                  onChange={e => setMotivoRechazo(e.target.value)}
                  placeholder="Razón del rechazo/cancelación..."
                  className="bg-slate-900 border-red-900/50 text-white text-xs min-h-[60px] resize-none"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex w-full flex-col gap-3 lg:w-auto">
          {isSaved && savedQuoteId && (
            <div className="rounded border border-brand-green/30 bg-brand-green/10 px-4 py-2 text-center text-xs font-semibold text-brand-green">
              Cotización guardada exitosamente. ID: {savedQuoteId.toString().padStart(4, '0')}
            </div>
          )}
          
          <Button
            onClick={handleSave}
            disabled={!selectedClient || items.length === 0 || isSaving}
            className="w-full h-12 bg-slate-800 text-white hover:bg-slate-700 font-tech font-bold uppercase tracking-widest shadow-lg transition-colors border border-slate-700"
          >
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5 text-brand-blue" />}
            {isSaving ? 'Guardando...' : 'Guardar Progreso'}
          </Button>

          <Button
            onClick={handleViewPdf}
            disabled={!selectedClient || items.length === 0}
            className="w-full h-14 bg-brand-blue text-slate-950 hover:bg-brand-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all font-tech font-bold uppercase tracking-widest text-sm"
          >
            <FileText className="mr-2 h-5 w-5" />
            Generar PDF Comercial
          </Button>
        </div>
      </div>
    </div>
  );
}
