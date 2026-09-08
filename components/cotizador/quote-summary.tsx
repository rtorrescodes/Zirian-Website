'use client';

import React from 'react';
import { Save, FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface QuoteSummaryProps {
  children?: React.ReactNode;
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
  onDeleteQuote?: () => void;
}

export function QuoteSummary({
  children,
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
  onDeleteQuote,
}: QuoteSummaryProps) {
  const currencyExact = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* 1. Área Scrollable Unificada (Items + Configuración) */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-800/80">
        {/* Items del Carrito y Archivos Adjuntos */}
        {children}

        {/* Panel de Ajustes y Configuración de Cotización */}
        <div className="p-4 md:p-6 bg-slate-950/40 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Col 1: Switches & Estatus */}
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

              <div>
                <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Estatus de Cotización</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Enviada">Enviada</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {(status === 'Rechazada' || status === 'Cancelada') && (
                <div>
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

            {/* Col 2: Tipo de Proyecto / Plantilla & Precios & Notas */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Tipo de Proyecto / Plantilla PDF</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
                >
                  {userRole === 'Distribuidor' ? (
                    <>
                      <option value="general_distribuidor">Cotización General (Distribuidor)</option>
                      <option value="general_distribuidor_fotos">Cotización General con Fotos</option>
                    </>
                  ) : (
                    <>
                      <option value="general">Cotización General (Zirian BCS)</option>
                      <option value="ev_charger">Cargadores EV (Zirian BCS)</option>
                      <option value="ev_charger_en">Cargadores EV - Inglés (Zirian BCS)</option>
                      <option value="general_distribuidor">Cotización General - Plantilla Distribuidor</option>
                      <option value="general_distribuidor_fotos">Cotización General - Plantilla Distribuidor (Con Fotos)</option>
                    </>
                  )}
                </select>
              </div>

              <details 
                className="group bg-slate-900/50 p-3 rounded-xl border border-slate-800" 
                open={template.includes('ev_charger')}
              >
                <summary className="cursor-pointer font-tech text-[10px] font-bold uppercase tracking-widest text-brand-cyan hover:text-white transition-colors list-none flex items-center gap-2 select-none">
                  <span className="transform transition-transform group-open:rotate-90">▶</span>
                  Ajustes Avanzados de Precios por Grupo
                </summary>
                <div className="pt-3 space-y-3">
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
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                      <Label className="font-tech text-[10px] font-bold uppercase tracking-widest text-brand-blue block">
                        Ajustar Precios por Grupo
                      </Label>
                      {Object.entries(groupPrices).map(([gName, val]) => (
                        <div key={gName} className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-400 truncate">{gName}</span>
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-xs text-slate-500">$</span>
                            <input
                              type="number"
                              value={val === 0 ? '' : val}
                              onChange={(e) => onGroupPriceChange(gName, Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1 pl-5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Nota Técnica (Opcional)</label>
                <textarea
                  value={notasCliente}
                  onChange={(e) => setNotasCliente(e.target.value)}
                  placeholder="Añade notas adicionales para el cliente..."
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue min-h-[55px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Acciones y Totales Fija (Siempre visible al fondo del contenedor) */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Total y Ganancia */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400 block">Total Cotización</span>
              <span className="font-mono text-2xl font-bold text-brand-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                {currencyExact(total)}
              </span>
            </div>
            {ganancia > 0 && (
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400 block">
                  {userRole === 'Distribuidor' ? 'Comisión Est.' : 'Ganancia Est.'}
                </span>
                <span className="font-mono text-sm font-bold text-amber-500">
                  {currencyExact(ganancia)}
                </span>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {isSaved && savedQuoteId && (
              <div className="rounded border border-brand-green/30 bg-brand-green/10 px-3 py-1.5 text-center text-xs font-semibold text-brand-green hidden lg:block mr-auto">
                ID: {savedQuoteId.toString().padStart(4, '0')}
              </div>
            )}

            {onDeleteQuote && savedQuoteId && (
              <Button
                type="button"
                onClick={onDeleteQuote}
                disabled={isSaving}
                variant="outline"
                className="h-11 border-red-900/50 text-red-400 hover:bg-red-950/40 hover:text-red-300 hover:border-red-700 font-tech text-xs uppercase tracking-wider px-3 shadow-lg"
                title="Eliminar esta cotización permanentemente"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span className="hidden md:inline">Eliminar</span>
              </Button>
            )}

            <Button
              onClick={handleSave}
              disabled={!selectedClient || items.length === 0 || isSaving}
              className="h-11 bg-slate-800 text-white hover:bg-slate-700 font-tech font-bold uppercase tracking-widest text-xs border border-slate-700 px-5 shadow-lg flex-1 sm:flex-initial"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 text-brand-blue" />}
              <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </Button>

            <Button
              onClick={handleViewPdf}
              disabled={!selectedClient || items.length === 0}
              className="h-11 bg-brand-blue text-slate-950 hover:bg-brand-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all font-tech font-bold uppercase tracking-widest text-xs px-6 shadow-lg flex-1 sm:flex-initial font-bold"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Generar PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

