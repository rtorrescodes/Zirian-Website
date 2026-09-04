'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  MapPin,
  CheckCircle2,
  Wrench,
  Send,
  Loader2,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Phone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { submitStoreAcQuote } from '@/app/actions/store-quote';

interface AcQuoteModalProps {
  productId: string;
  productTitle: string;
  productModel: string;
  productBrand: string;
  productImage?: string | null;
  rawCostMxn: number; // Costo base con IVA
  triggerText?: string;
  triggerClassName?: string;
}

const RIVIERA_MAYA_CITIES = [
  'Cancún',
  'Puerto Aventuras',
  'Playa del Carmen',
  'Tulum',
  'Akumal',
  'Puerto Morelos',
];

const BCS_CITIES = [
  'San José del Cabo',
  'Cabo San Lucas',
  'Cabo del Este',
  'La Paz',
  'Todos Santos',
  'Loreto',
];

export function AcQuoteModal({
  productId,
  productTitle,
  productModel,
  productBrand,
  productImage,
  rawCostMxn,
  triggerText = 'Cotizar Equipo',
  triggerClassName,
}: AcQuoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [region, setRegion] = useState<'riviera_maya' | 'baja_california_sur'>('riviera_maya');
  const [city, setCity] = useState(RIVIERA_MAYA_CITIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [requiresInstallation, setRequiresInstallation] = useState(true);

  // Contact form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Calculations:
  // Riviera Maya: Costo con IVA + $1,000 (Zirian) + $1,000 (Polo) = +$2,000 MXN
  // BCS: Costo con IVA + $1,500 MXN
  const unitPrice = region === 'riviera_maya'
    ? Math.round(rawCostMxn + 2000)
    : Math.round(rawCostMxn + 1500);

  const totalPrice = unitPrice * quantity;

  const handleRegionChange = (newRegion: 'riviera_maya' | 'baja_california_sur') => {
    setRegion(newRegion);
    setCity(newRegion === 'riviera_maya' ? RIVIERA_MAYA_CITIES[0] : BCS_CITIES[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    setIsLoading(true);
    try {
      const res = await submitStoreAcQuote({
        productId,
        productTitle,
        productModel,
        productBrand,
        quantity,
        unitPrice,
        total: totalPrice,
        region,
        city,
        requiresInstallation,
        clientName,
        clientPhone,
        clientEmail,
        address,
        notes,
      });

      if (res.success) {
        setIsSubmitted(true);
        setStatusMessage(res.message);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al enviar tu cotización. Por favor contáctanos por WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setAddress('');
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger
        className={
          triggerClassName ||
          'w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,163,255,0.3)] flex items-center justify-center gap-2 cursor-pointer'
        }
      >
        <span>{triggerText}</span>
        <ArrowRight className="w-4 h-4" />
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 p-6 sm:p-8 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-[10px] font-tech font-bold uppercase">
              Cotización Directa de Minisplit
            </Badge>
            <span className="text-xs text-slate-400 font-mono">{productModel}</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-white font-tech tracking-wide mt-1">
            {productTitle}
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white font-tech uppercase tracking-wide">
                ¡Solicitud Enviada con Éxito!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2 font-mono">
              <p><strong className="text-white">Equipo:</strong> {productModel} ({quantity} pza{quantity > 1 ? 's' : ''})</p>
              <p><strong className="text-white">Total Estimado:</strong> ${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</p>
              <p><strong className="text-white">Región:</strong> {region === 'riviera_maya' ? 'Riviera Maya' : 'Baja California Sur'} ({city})</p>
              <p><strong className="text-white">Instalación:</strong> {requiresInstallation ? 'Solicitada' : 'Solo Suministro'}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={
                  region === 'riviera_maya'
                    ? `https://wa.me/5215528613165?text=${encodeURIComponent(`Hola Polo, acabo de cotizar en Zirian ${quantity} minisplit(s) ${productModel} para ${city}. Mi nombre es ${clientName}.`)}`
                    : `https://wa.me/526246220525?text=${encodeURIComponent(`Hola Zirian, acabo de cotizar ${quantity} minisplit(s) ${productModel} para ${city}. Mi nombre es ${clientName}.`)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <MessageCircle className="w-4 h-4" />
                Continuar por WhatsApp ({region === 'riviera_maya' ? 'Riviera Maya' : 'Los Cabos'})
              </a>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 font-tech text-xs uppercase"
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Step 1: Region Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
                1. Selecciona tu Región de Entrega / Instalación:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRegionChange('riviera_maya')}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    region === 'riviera_maya'
                      ? 'bg-brand-blue/15 border-brand-blue text-white shadow-[0_0_15px_rgba(0,163,255,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-tech font-bold text-sm text-white uppercase flex items-center gap-1.5">
                      🌴 Riviera Maya
                    </span>
                    {region === 'riviera_maya' && (
                      <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Cancún, Playa del Carmen, Tulum, Puerto Aventuras.
                  </p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Atención local: Polo Esponda
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRegionChange('baja_california_sur')}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    region === 'baja_california_sur'
                      ? 'bg-brand-blue/15 border-brand-blue text-white shadow-[0_0_15px_rgba(0,163,255,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-tech font-bold text-sm text-white uppercase flex items-center gap-1.5">
                      🌵 Baja California Sur
                    </span>
                    {region === 'baja_california_sur' && (
                      <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    San José del Cabo, Cabo San Lucas, Cabo del Este, La Paz.
                  </p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Atención local: Ing. Rodrigo Torres
                  </p>
                </button>
              </div>
            </div>

            {/* City & Quantity Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
                  Ciudad o Municipio:
                </Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-cyan"
                >
                  {(region === 'riviera_maya' ? RIVIERA_MAYA_CITIES : BCS_CITIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
                  Cantidad de Equipos:
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-cyan text-center font-bold"
                  />
                  <span className="text-xs text-slate-400 font-tech">pzas</span>
                </div>
              </div>
            </div>

            {/* Installation Toggle */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white font-tech uppercase tracking-wide flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-brand-cyan" />
                  ¿Deseas incluir instalación profesional?
                </span>
                <p className="text-[11px] text-slate-400">
                  Incluye visita de inspección técnica, tendido de tubería y soporte anticorrosivo en {city}.
                </p>
              </div>
              <Switch
                checked={requiresInstallation}
                onCheckedChange={setRequiresInstallation}
                className="data-[state=checked]:bg-brand-cyan"
              />
            </div>

            {/* Price Preview Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-brand-blue/10 border border-brand-blue/30 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-tech uppercase tracking-wider">
                  Precio Estimado por Unidad:
                </span>
                <p className="text-xl font-extrabold text-white font-tech">
                  ${unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  <span className="text-[10px] text-slate-400 font-normal ml-1">con IVA</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-brand-cyan font-tech uppercase tracking-wider font-bold">
                  Total Estimado ({quantity} {quantity === 1 ? 'equipo' : 'equipos'}):
                </span>
                <p className="text-2xl font-black text-emerald-400 font-tech">
                  ${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </p>
              </div>
            </div>

            {/* Step 2: Contact Information */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <Label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
                2. Datos de Contacto para Confirmar tu Cotización:
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="clientName" className="text-[11px] text-slate-300">
                    Nombre Completo *
                  </Label>
                  <Input
                    id="clientName"
                    required
                    placeholder="Ej. Roberto Méndez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clientPhone" className="text-[11px] text-slate-300">
                    Teléfono Celular / WhatsApp *
                  </Label>
                  <Input
                    id="clientPhone"
                    required
                    type="tel"
                    placeholder="Ej. 984 123 4567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="clientEmail" className="text-[11px] text-slate-300">
                  Correo Electrónico (Opcional)
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs text-white"
                />
              </div>

              {requiresInstallation && (
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-[11px] text-slate-300">
                    Colonia o Fraccionamiento para la instalación en {city}
                  </Label>
                  <Input
                    id="address"
                    placeholder="Ej. Fracc. Playacar / Residencial Campestre"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-[11px] text-slate-300">
                  Notas adicionales (voltaje requerido, altura de instalación, etc.)
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="¿Algún detalle específico de tu proyecto?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs text-white resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !clientName || !clientPhone}
              className="w-full py-6 bg-gradient-to-r from-brand-blue to-cyan-500 hover:from-brand-blue/90 hover:to-cyan-400 text-white font-tech font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,163,255,0.3)] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando Solicitud...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Cotización para {region === 'riviera_maya' ? 'Riviera Maya' : 'Baja California Sur'}</span>
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
