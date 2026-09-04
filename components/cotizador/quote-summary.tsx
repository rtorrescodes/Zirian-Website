'use client';

import { Save, FileText, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuoteSummaryProps {
  userRole?: string;
  items: any[];
  status: string;
  setStatus: (status: string) => void;
  requiereFactura: boolean;
  setRequiereFactura: (val: boolean) => void;
  cobroTarjeta: boolean;
  setCobroTarjeta: (val: boolean) => void;
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
  originalSubtotal: number;
  groupPrices: Record<string, number>;
  onGroupPriceChange: (gName: string, val: number) => void;
  iva: number;
  total: number;
  isSaving: boolean;
  isSaved: boolean;
  savedQuoteId: number | null;
  handleSave?: () => void;
  onSave?: () => void;
  handleViewPdf?: () => void;
  selectedClient?: any;
}

export function QuoteSummary({
  userRole,
  items,
  status,
  setStatus,
  requiereFactura,
  setRequiereFactura,
  cobroTarjeta,
  setCobroTarjeta,
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
  originalSubtotal,
  groupPrices,
  onGroupPriceChange,
  total,
  isSaving,
  isSaved,
  savedQuoteId,
  handleSave,
  onSave,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Col 1: Totals and Status */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="cobro-tarjeta"
              checked={cobroTarjeta}
              onCheckedChange={setCobroTarjeta}
              className="data-[state=checked]:bg-brand-blue"
            />
            <Label htmlFor="cobro-tarjeta" className="font-tech text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              Pago con Tarjeta (Stripe) <Badge variant="outline" className="text-[9px] h-4 bg-amber-500/10 text-amber-500 border-amber-500/20 px-1 py-0">+4.2%</Badge>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
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

          <dl className="border-t border-slate-800 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <dt className="font-tech text-sm font-bold uppercase tracking-widest text-white">Total</dt>
              <dd className="font-mono text-2xl font-bold text-brand-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                {currencyExact(total)}
              </dd>
            </div>
            
            {ganancia > 0 && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                <dt className="font-tech text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {userRole === 'Distribuidor' ? 'Comisión Estimada' : 'Ganancia Estimada'}
                </dt>
                <dd className="font-mono text-sm font-bold text-amber-500">
                  {currencyExact(ganancia)}
                </dd>
              </div>
            )}
          </dl>

          <div className="border-t border-slate-800 pt-4 mt-auto">
            <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400 mb-2 block">Estatus de Cotización</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
            >
              <option value="Borrador">Borrador</option>
              <option value="Enviada">Enviada</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {(status === 'Rechazada' || status === 'Cancelada') && (
            <div className="mt-2">
              <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400 mb-1 block">Motivo</label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder={`¿Por qué fue ${status.toLowerCase()}?`}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-red-400 min-h-[60px]"
              />
            </div>
          )}
        </div>

        {/* Col 2: Settings & Notes */}
        <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Tipo de Proyecto / Plantilla PDF</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
            >
              {userRole === 'Distribuidor' ? (
                <>
                  <option value="general_distribuidor">Cotización General</option>
                </>
              ) : (
                <>
                  <option value="ev_charger">Cargadores EV</option>
                  <option value="ev_charger_en">Cargadores EV (Inglés)</option>
                  <option value="general">Cotización General (CCTV, Redes, etc)</option>
                  <option value="general_distribuidor">Cotización General - Plantilla Distribuidor</option>
                  <option value="general_distribuidor_fotos">Cotización General - Plantilla Distribuidor (Con Fotos)</option>
                </>
              )}
            </select>
          </div>

          <details 
            className="group" 
            open={template.includes('ev_charger')}
          >
            <summary className="cursor-pointer font-tech text-[10px] font-bold uppercase tracking-widest text-brand-cyan hover:text-white transition-colors list-none flex items-center gap-2 select-none mb-3">
              <span className="transform transition-transform group-open:rotate-90">▶</span>
              Ajustes Avanzados de Precios
            </summary>
            <div className="pl-4 border-l border-slate-800 space-y-4 mb-2">
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
              
              {!mostrarDesglose && Object.keys(groupPrices).length > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                  <Label className="font-tech text-[10px] font-bold uppercase tracking-widest text-brand-blue block mb-2">
                    Ajustar Precios por Grupo
                  </Label>
                  {Object.entries(groupPrices).map(([gName, val]) => (
                    <div key={gName} className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 truncate pr-2">{gName}</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-xs text-slate-500">$</span>
                        <input
                          type="number"
                          value={val === 0 ? '' : val}
                          onChange={(e) => onGroupPriceChange(gName, Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded p-1 pl-5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>

          <div className="flex flex-col gap-2 mt-auto">
            <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Nota Técnica (Opcional)</label>
            <textarea
              value={notasCliente}
              onChange={(e) => setNotasCliente(e.target.value)}
              placeholder="Añade notas adicionales para el cliente..."
              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue min-h-[60px]"
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-800 pt-6 mt-6 items-center justify-end">
        {isSaved && savedQuoteId && (
          <div className="rounded border border-brand-green/30 bg-brand-green/10 px-4 py-2 text-center text-xs font-semibold text-brand-green mr-auto">
            Guardada. ID: {savedQuoteId.toString().padStart(4, '0')}
          </div>
        )}
        
        <Button
          onClick={handleSave}
          disabled={!selectedClient || items.length === 0 || isSaving}
          className="w-full sm:w-auto h-12 bg-slate-800 text-white hover:bg-slate-700 font-tech font-bold uppercase tracking-widest shadow-lg transition-colors border border-slate-700 px-8"
        >
          {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5 text-brand-blue" />}
          {isSaving ? 'Guardando...' : 'Guardar Progreso'}
        </Button>

        <Button
          onClick={handleViewPdf}
          disabled={!selectedClient || items.length === 0}
          className="w-full sm:w-auto h-12 bg-brand-blue text-slate-950 hover:bg-brand-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all font-tech font-bold uppercase tracking-widest text-sm px-8"
        >
          <FileText className="mr-2 h-5 w-5" />
          Generar PDF
        </Button>
      </div>
    </div>
  );
}

