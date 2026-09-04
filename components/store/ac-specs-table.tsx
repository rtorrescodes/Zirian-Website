'use client';

import React from 'react';
import {
  ThermometerSnowflake,
  Zap,
  Flame,
  Wind,
  ShieldCheck,
  Volume2,
  Wifi,
  Sun,
  Activity,
  Award,
} from 'lucide-react';

interface AcSpecsTableProps {
  product: {
    titulo: string;
    modelo: string;
    descripcion?: string;
    caracteristicas?: string[];
  };
  locale?: string;
}

export function AcSpecsTable({ product, locale = 'es' }: AcSpecsTableProps) {
  const isEn = locale === 'en';
  const text = `${product.titulo} ${product.modelo} ${(product.caracteristicas || []).join(' ')}`.toLowerCase();

  // 1. Determine Capacity (BTU / Tons)
  let btu = '12,000 BTU';
  let tons = '1.0 Tonelada';
  if (text.includes('36000') || text.includes('36,000') || text.includes('3 ton') || text.includes('3ton') || text.includes('36k')) {
    btu = '36,000 BTU';
    tons = isEn ? '3.0 Tons' : '3.0 Toneladas';
  } else if (text.includes('24000') || text.includes('24,000') || text.includes('2 ton') || text.includes('2ton') || text.includes('24k')) {
    btu = '24,000 BTU';
    tons = isEn ? '2.0 Tons' : '2.0 Toneladas';
  } else if (text.includes('18000') || text.includes('18,000') || text.includes('1.5 ton') || text.includes('1.5ton') || text.includes('18k')) {
    btu = '18,000 BTU';
    tons = isEn ? '1.5 Tons' : '1.5 Toneladas';
  } else if (text.includes('12000') || text.includes('12,000') || text.includes('1 ton') || text.includes('1ton') || text.includes('12k')) {
    btu = '12,000 BTU';
    tons = isEn ? '1.0 Ton' : '1.0 Tonelada';
  }

  // 2. Mode: Cool Only vs Heat & Cool
  const isHeatCool = text.includes('frío/calor') || text.includes('frio/calor') || text.includes('frio calor') || text.includes('frío y calor') || text.includes('heat pump') || text.includes('calefaccion') || text.includes('calefacción') || text.includes('bomba de calor');
  const modeText = isHeatCool 
    ? (isEn ? 'Cooling & Heating' : 'Frío y Calor (Bomba de Calor)')
    : (isEn ? 'Cool Only' : 'Solo Frío');

  // 3. Voltage
  let voltage = '220 V ~ 60 Hz / 1 Fase';
  if (text.includes('110v') || text.includes('115v') || text.includes('110 v') || text.includes('115 v')) {
    voltage = '110-115 V ~ 60 Hz / 1 Fase';
  }

  // 4. Refrigerant
  const isR32 = text.includes('r32') || text.includes('r-32') || !text.includes('r410');
  const refrigerant = isR32 ? 'R32 Ecológico (Bajo GWP)' : 'R410A';

  // 5. SEER
  let seer = 'SEER 17 (Full Inverter)';
  if (text.includes('21 seer') || text.includes('seer 21') || text.includes('21seer')) {
    seer = 'SEER 21 (Ultra Inverter)';
  } else if (text.includes('18 seer') || text.includes('seer 18')) {
    seer = 'SEER 18 (Inverter)';
  } else if (text.includes('17 seer') || text.includes('seer 17')) {
    seer = 'SEER 17 (Full Inverter)';
  }

  const specs = [
    {
      icon: ThermometerSnowflake,
      label: isEn ? 'Thermal Capacity' : 'Capacidad Térmica',
      value: `${btu} (${tons})`,
      highlight: true,
    },
    {
      icon: isHeatCool ? Flame : Wind,
      label: isEn ? 'Operating Cycle' : 'Modalidad de Ciclo',
      value: isHeatCool ? (isEn ? 'Cool & Heat' : 'Frío y Calor (Bomba)') : (isEn ? 'Cool Only' : 'Solo Frío'),
    },
    {
      icon: Zap,
      label: isEn ? 'Electrical Supply' : 'Alimentación Eléctrica',
      value: voltage,
    },
    {
      icon: Activity,
      label: isEn ? 'Energy Efficiency' : 'Eficiencia Energética',
      value: seer,
      highlight: true,
    },
    {
      icon: Sun,
      label: isEn ? 'Refrigerant Gas' : 'Gas Refrigerante',
      value: refrigerant,
    },
    {
      icon: ShieldCheck,
      label: isEn ? 'Coil Protection' : 'Protección de Serpentín',
      value: 'Blue Fin Marina',
    },
    {
      icon: Volume2,
      label: isEn ? 'Acoustic Level' : 'Nivel Sonoro',
      value: '23 dB (Ultra Silencio)',
    },
    {
      icon: Wifi,
      label: isEn ? 'Connectivity' : 'Conectividad Wi-Fi',
      value: 'Smart Life + Alexa',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 my-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              {isEn ? 'Technical Specifications' : 'Ficha de Ingeniería y Especificaciones'}
            </h4>
            <p className="text-[10px] text-slate-400">
              {isEn ? 'Certified values for residential and coastal installation' : 'Valores certificados para clima costero'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          AUFIT Pro
        </span>
      </div>

      <div className="divide-y divide-slate-800/60">
        {specs.map((spec, i) => {
          const Icon = spec.icon;
          return (
            <div
              key={i}
              className="py-2 px-2 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-2 shrink-0">
                <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                  {spec.label}
                </span>
              </div>

              <div className="text-right">
                <span className={`text-xs font-mono font-bold ${spec.highlight ? 'text-cyan-400' : 'text-slate-100'}`}>
                  {spec.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
