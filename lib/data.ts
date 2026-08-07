// Datos de ejemplo (mock) para el panel de operaciones de Zirian.
// Sustituibles luego por una base de datos real (p. ej. Neon).

export const IVA_RATE = 0.16

export type Category =
  | 'Cargadores'
  | 'Cables'
  | 'Tuberías'
  | 'Protecciones'
  | 'Mano de Obra'

export interface Product {
  id: string
  sku: string
  name: string
  category: Category
  unit: string
  price: number
  brand?: string
}

export interface Client {
  id: string
  name: string
  type: 'Residencial' | 'Hotelero' | 'Comercial' | 'Airbnb'
  location: string
  contact: string
}

export const clients: Client[] = [
  { id: 'c1', name: 'Villa Serena — Pedregal', type: 'Residencial', location: 'Cabo San Lucas', contact: 'Alejandro Ríos' },
  { id: 'c2', name: 'Hotel Marea Azul', type: 'Hotelero', location: 'San José del Cabo', contact: 'Dirección de Ingeniería' },
  { id: 'c3', name: 'Plaza Península', type: 'Comercial', location: 'Cabo San Lucas', contact: 'Admin. de Plaza' },
  { id: 'c4', name: 'Casa Miramar (Airbnb)', type: 'Airbnb', location: 'El Tezal', contact: 'Fernanda Loya' },
  { id: 'c5', name: 'Condominios Costa Bella', type: 'Residencial', location: 'La Paz', contact: 'Comité Vecinal' },
  { id: 'c6', name: 'Desarrollo Puerta del Mar', type: 'Comercial', location: 'San José del Cabo', contact: 'Ing. Marcos Vidal' },
]

export const products: Product[] = [
  { id: 'p1', sku: 'CHG-T2-22', name: 'Cargador Wallbox Trifásico 22kW', category: 'Cargadores', unit: 'pza', price: 28900, brand: 'Zirian Pro' },
  { id: 'p2', sku: 'CHG-T2-11', name: 'Cargador Wallbox 11kW OCPP', category: 'Cargadores', unit: 'pza', price: 19500, brand: 'Zirian Pro' },
  { id: 'p3', sku: 'CHG-DC-30', name: 'Cargador DC Rápido 30kW', category: 'Cargadores', unit: 'pza', price: 189000, brand: 'Zirian Fleet' },
  { id: 'p4', sku: 'CBL-6AWG', name: 'Cable THHN Calibre 6 AWG', category: 'Cables', unit: 'm', price: 78 },
  { id: 'p5', sku: 'CBL-4AWG', name: 'Cable THHN Calibre 4 AWG', category: 'Cables', unit: 'm', price: 122 },
  { id: 'p6', sku: 'CBL-2AWG', name: 'Cable THHN Calibre 2 AWG', category: 'Cables', unit: 'm', price: 198 },
  { id: 'p7', sku: 'TUB-EMT-3', name: 'Tubería EMT 3/4"', category: 'Tuberías', unit: 'm', price: 64 },
  { id: 'p8', sku: 'TUB-PVC-1', name: 'Tubería PVC Conduit 1"', category: 'Tuberías', unit: 'm', price: 52 },
  { id: 'p9', sku: 'PRO-BRK-40', name: 'Interruptor Termomagnético 2x40A', category: 'Protecciones', unit: 'pza', price: 1240 },
  { id: 'p10', sku: 'PRO-GFCI', name: 'Protección Diferencial Tipo A GFCI', category: 'Protecciones', unit: 'pza', price: 2180 },
  { id: 'p11', sku: 'PRO-SPD', name: 'Supresor de Picos Clase II', category: 'Protecciones', unit: 'pza', price: 1650 },
  { id: 'p12', sku: 'MO-INST', name: 'Instalación certificada NOM-001', category: 'Mano de Obra', unit: 'servicio', price: 6500 },
  { id: 'p13', sku: 'MO-TRAM', name: 'Trámite y medidor independiente CFE', category: 'Mano de Obra', unit: 'servicio', price: 4200 },
  { id: 'p14', sku: 'MO-CANAL', name: 'Canalización y obra civil (por metro)', category: 'Mano de Obra', unit: 'm', price: 340 },
]

export const categories: Category[] = [
  'Cargadores',
  'Cables',
  'Tuberías',
  'Protecciones',
  'Mano de Obra',
]

export const currency = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)

export const currencyExact = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(n)

/* ---------- Dashboard mock data ---------- */

export const kpis = [
  { key: 'ingresos', label: 'Ingresos del mes', value: 1284500, delta: 12.4, prefix: '$' },
  { key: 'cotizaciones', label: 'Cotizaciones activas', value: 38, delta: 8.1 },
  { key: 'proyectos', label: 'Instalaciones en curso', value: 14, delta: -3.2 },
  { key: 'tickets', label: 'Tickets abiertos', value: 9, delta: -18.0 },
]

export const revenueByMonth = [
  { month: 'Ene', cotizado: 820000, cerrado: 540000 },
  { month: 'Feb', cotizado: 910000, cerrado: 610000 },
  { month: 'Mar', cotizado: 1040000, cerrado: 720000 },
  { month: 'Abr', cotizado: 980000, cerrado: 690000 },
  { month: 'May', cotizado: 1180000, cerrado: 860000 },
  { month: 'Jun', cotizado: 1320000, cerrado: 980000 },
  { month: 'Jul', cotizado: 1450000, cerrado: 1120000 },
  { month: 'Ago', cotizado: 1580000, cerrado: 1284500 },
]

export const pipeline = [
  { stage: 'Prospecto', value: 42 },
  { stage: 'Levantamiento', value: 28 },
  { stage: 'Cotizado', value: 19 },
  { stage: 'Aprobado', value: 12 },
  { stage: 'Instalado', value: 9 },
]

export const leadSources = [
  { source: 'Google Ads', value: 38, fill: 'var(--color-google)' },
  { source: 'Orgánico', value: 27, fill: 'var(--color-organico)' },
  { source: 'Referidos', value: 21, fill: 'var(--color-referidos)' },
  { source: 'Directo', value: 14, fill: 'var(--color-directo)' },
]

export const trafficByDay = [
  { day: 'Lun', sesiones: 420, conversiones: 18 },
  { day: 'Mar', sesiones: 510, conversiones: 22 },
  { day: 'Mié', sesiones: 480, conversiones: 20 },
  { day: 'Jue', sesiones: 620, conversiones: 31 },
  { day: 'Vie', sesiones: 720, conversiones: 38 },
  { day: 'Sáb', sesiones: 540, conversiones: 24 },
  { day: 'Dom', sesiones: 360, conversiones: 12 },
]

export const recentQuotes = [
  { id: 'COT-1042', client: 'Hotel Marea Azul', total: 412800, status: 'Enviada', date: '02 Ago' },
  { id: 'COT-1041', client: 'Villa Serena — Pedregal', total: 58400, status: 'Aprobada', date: '01 Ago' },
  { id: 'COT-1040', client: 'Plaza Península', total: 236500, status: 'En revisión', date: '31 Jul' },
  { id: 'COT-1039', client: 'Casa Miramar (Airbnb)', total: 41200, status: 'Aprobada', date: '30 Jul' },
  { id: 'COT-1038', client: 'Condominios Costa Bella', total: 128900, status: 'Enviada', date: '29 Jul' },
]

export type QuoteStatus = 'Enviada' | 'Aprobada' | 'En revisión' | 'Rechazada'
