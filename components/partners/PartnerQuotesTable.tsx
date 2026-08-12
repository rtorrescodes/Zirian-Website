'use client';

import { useState } from 'react';
import { CheckCircle2, Edit2, Save, X } from 'lucide-react';
import { updateQuotePartnerCommission } from '@/app/actions/quotes';

export default function PartnerQuotesTable({ clients }: { clients: any[] }) {
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const handleEdit = (quote: any) => {
    setEditingQuoteId(quote.id);
    setEditValue(quote.calculatedCommission.toString());
  };

  const handleSave = async (quoteId: number) => {
    setIsSaving(true);
    try {
      const val = parseFloat(editValue);
      await updateQuotePartnerCommission(quoteId, isNaN(val) ? null : val);
      setEditingQuoteId(null);
    } catch (error) {
      console.error(error);
      alert('Error al guardar comisión');
    } finally {
      setIsSaving(false);
    }
  };

  if (clients.length === 0) {
    return <div className="p-12 text-center text-muted-foreground">Aún no ha referido clientes.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-xs uppercase text-muted-foreground border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">Cliente</th>
            <th className="px-6 py-4 font-medium">Cotización Aprobada</th>
            <th className="px-6 py-4 font-medium">Monto Total</th>
            <th className="px-6 py-4 font-medium text-right">Comisión a Pagar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {clients.map((cliente) => 
            cliente.quotes.length > 0 ? cliente.quotes.map((quote: any, index: number) => (
              <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                {index === 0 ? (
                  <td className="px-6 py-4" rowSpan={cliente.quotes.length}>
                    <p className="font-medium text-foreground">{cliente.nombre}</p>
                    {cliente.empresa && <p className="text-xs text-muted-foreground">{cliente.empresa}</p>}
                  </td>
                ) : null}
                <td className="px-6 py-4">
                  <span className="font-medium text-foreground">COT-{new Date(quote.fecha_creacion).getFullYear()}-{String(quote.id).padStart(4, '0')}</span>
                  <div className="text-[10px] text-brand-green flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Aprobada
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-foreground">
                  {formatCurrency(quote.total)}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingQuoteId === quote.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                          type="number"
                          className="w-24 pl-6 pr-2 py-1 text-sm border rounded-md"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          disabled={isSaving}
                        />
                      </div>
                      <button onClick={() => handleSave(quote.id)} disabled={isSaving} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Save className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingQuoteId(null)} disabled={isSaving} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-3 group">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-brand-cyan">
                          {formatCurrency(quote.calculatedCommission)}
                        </span>
                        {quote.comision_partner !== null && (
                          <span className="text-[10px] text-muted-foreground">Monto Editado</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleEdit(quote)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded transition-all"
                        title="Editar Comisión"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : null
          )}
        </tbody>
      </table>
    </div>
  );
}
