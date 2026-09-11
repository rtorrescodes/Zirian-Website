// Esquema de comisiones y precios AUFIT para Distribuidores (basado en 'Autfit - Fórmulas')

export interface AufitModelConfig {
  modelo: string;
  normalizedModel: string;
  capacidad: string;
  voltaje: string;
  seer: number;
  costoSyscom: number;
  costoSyscomConIva: number;
  precioEspecial: number;
  precioEspecialConIva: number;
  impuestos: number;
  comision: number;
  gananciaAlddea: number;
}

export const AUFIT_MODELS_TABLE: AufitModelConfig[] = [
  {
    modelo: 'CCI-R32-12K-220',
    normalizedModel: 'CCIR3212K220',
    capacidad: '12,000 BTU',
    voltaje: '220 V',
    seer: 17.0,
    costoSyscom: 4044.36,
    costoSyscomConIva: 4691.46,
    precioEspecial: 6751.42,
    precioEspecialConIva: 7831.65,
    impuestos: 1209.86,
    comision: 1061.68,
    gananciaAlddea: 868.65,
  },
  {
    modelo: 'CHI-R32-12K-220',
    normalizedModel: 'CHIR3212K220',
    capacidad: '12,000 BTU',
    voltaje: '220 V',
    seer: 17.0,
    costoSyscom: 3809.40,
    costoSyscomConIva: 4418.90,
    precioEspecial: 6359.18,
    precioEspecialConIva: 7376.65,
    impuestos: 1139.57,
    comision: 1000.00,
    gananciaAlddea: 818.18,
  },
  {
    modelo: 'CHI-R32-12K-110',
    normalizedModel: 'CHIR3212K110',
    capacidad: '12,000 BTU',
    voltaje: '110 V',
    seer: 20.0,
    costoSyscom: 4388.57,
    costoSyscomConIva: 5090.74,
    precioEspecial: 7326.02,
    precioEspecialConIva: 8498.18,
    impuestos: 1312.82,
    comision: 1152.04,
    gananciaAlddea: 942.58,
  },
  {
    modelo: 'CHI-R32-24K-220',
    normalizedModel: 'CHIR3224K220',
    capacidad: '24,000 BTU',
    voltaje: '220 V',
    seer: 17.0,
    costoSyscom: 8466.10,
    costoSyscomConIva: 9820.68,
    precioEspecial: 14132.79,
    precioEspecialConIva: 16394.04,
    impuestos: 2825.24,
    comision: 2061.47,
    gananciaAlddea: 1686.65,
  },
  {
    modelo: 'CHI-R32-24K-220-S21',
    normalizedModel: 'CHIR3224K220S21',
    capacidad: '24,000 BTU',
    voltaje: '220 V',
    seer: 21.0,
    costoSyscom: 9834.91,
    costoSyscomConIva: 11408.50,
    precioEspecial: 16417.79,
    precioEspecialConIva: 19044.64,
    impuestos: 337.08,
    comision: 4014.48,
    gananciaAlddea: 3284.58,
  },
  {
    modelo: 'QHI-R32-36K-220',
    normalizedModel: 'QHIR3236K220',
    capacidad: '36,000 BTU',
    voltaje: '220 V',
    seer: 19.11,
    costoSyscom: 15135.48,
    costoSyscomConIva: 17557.16,
    precioEspecial: 25266.24,
    precioEspecialConIva: 29308.84,
    impuestos: 5319.13,
    comision: 3537.90,
    gananciaAlddea: 2894.65,
  },
];

export function normalizeModel(model: string = ''): string {
  return model.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

export function isAufitProduct(item: { marca?: string; modelo?: string; titulo?: string }): boolean {
  const marca = (item.marca || '').toUpperCase();
  const modelo = (item.modelo || '').toUpperCase();
  const titulo = (item.titulo || '').toUpperCase();

  if (marca.includes('AUFIT')) return true;
  if (titulo.includes('AUFIT')) return true;
  
  const norm = normalizeModel(modelo);
  if (norm.startsWith('CCI') || norm.startsWith('CHI') || norm.startsWith('QHI') || norm.startsWith('QCI')) {
    return true;
  }
  return false;
}

export interface AufitCalculationResult {
  isAufit: boolean;
  precioVentaMXN: number;     // Precio especial sin IVA (precio de venta sugerido al cliente)
  precioVentaConIva: number;  // Precio especial con IVA
  comisionDistribuidor: number; // Comisión neta en pesos para el distribuidor
  costoDistribuidorMXN: number; // Costo percibido por distribuidor (precioVentaMXN - comision)
  gananciaAlddea: number;     // Ganancia de Alddea
  impuestos: number;
}

export function calculateAufitPricing(params: {
  modelo?: string;
  marca?: string;
  titulo?: string;
  precioEspecialMXN: number; // Syscom precio_especial * TC
  costoDescuentoMXN: number; // Syscom precio_descuento * TC
}): AufitCalculationResult | null {
  if (!isAufitProduct(params)) {
    return null;
  }

  const norm = normalizeModel(params.modelo || '');
  const matched = AUFIT_MODELS_TABLE.find(m => m.normalizedModel === norm);

  if (matched) {
    return {
      isAufit: true,
      precioVentaMXN: matched.precioEspecial,
      precioVentaConIva: matched.precioEspecialConIva,
      comisionDistribuidor: matched.comision,
      costoDistribuidorMXN: Math.round((matched.precioEspecial - matched.comision) * 100) / 100,
      gananciaAlddea: matched.gananciaAlddea,
      impuestos: matched.impuestos,
    };
  }

  // Si es un modelo AUFIT fuera de la tabla base de 6 (ej. accesorios o nuevos modelos)
  // aplicamos la fórmula dinámica de la pestaña 'Autfit - Fórmulas':
  const precioVenta = params.precioEspecialMXN > 0 ? params.precioEspecialMXN : params.costoDescuentoMXN * 1.4;
  const precioVentaConIva = Math.round(precioVenta * 1.16 * 100) / 100;
  const costoConIva = Math.round(params.costoDescuentoMXN * 1.16 * 100) / 100;
  const margenConIva = Math.max(0, precioVentaConIva - costoConIva);
  
  // Tasa de impuestos efectiva promedio del esquema (38.528%)
  const impuestos = Math.round(margenConIva * 0.38528 * 100) / 100;
  const gananciaAntesComision = Math.max(0, margenConIva - impuestos);
  const comision = Math.round(gananciaAntesComision * 0.55 * 100) / 100;
  const gananciaAlddea = Math.round((gananciaAntesComision - comision) * 100) / 100;

  return {
    isAufit: true,
    precioVentaMXN: precioVenta,
    precioVentaConIva: precioVentaConIva,
    comisionDistribuidor: comision,
    costoDistribuidorMXN: Math.round((precioVenta - comision) * 100) / 100,
    gananciaAlddea: gananciaAlddea,
    impuestos: impuestos,
  };
}
