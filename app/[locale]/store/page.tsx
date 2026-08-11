import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';
import { searchSyscomProducts, SyscomProduct, getSyscomExchangeRate } from '@/lib/syscom';
import Link from 'next/link';
import { Search, ShoppingBag, ArrowRight, ShieldCheck, Zap, Server, Truck } from 'lucide-react';
import { SidebarEcommerceWidget } from '@/components/store/sidebar-ecommerce-widget';

export const dynamic = 'force-dynamic';

// MOCK DATA for preview when API is not configured
const mockProducts: SyscomProduct[] = [
  {
    producto_id: "mock-1",
    modelo: "DS-2CD2043G2-I",
    titulo: "Cámara IP Bala 4 Megapixel / Lente 2.8 mm / 30 mts IR / Exterior IP67",
    marca: "HIKVISION",
    img_portada: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop",
    link_privado: "#",
    precios: { precio_1: "85.50" },
  },
  {
    producto_id: "mock-2",
    modelo: "UAP-AC-PRO",
    titulo: "Punto de Acceso UniFi AC Pro / Interior/Exterior / 802.11ac",
    marca: "UBIQUITI",
    img_portada: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop",
    link_privado: "#",
    precios: { precio_1: "145.00" },
  },
  {
    producto_id: "mock-3",
    modelo: "SUN2000-5KTL",
    titulo: "Inversor de Red Huawei 5kW / 2 MPPT / Trifásico",
    marca: "HUAWEI",
    img_portada: "https://images.unsplash.com/photo-1509391366360-1e9e0481af1b?q=80&w=600&auto=format&fit=crop",
    link_privado: "#",
    precios: { precio_1: "850.00" },
  },
  {
    producto_id: "mock-4",
    modelo: "Pulsar Plus",
    titulo: "Cargador Inteligente EV Wallbox Pulsar Plus 48A",
    marca: "WALLBOX",
    img_portada: "https://images.unsplash.com/photo-1593941707882-a5bba14938cb?q=80&w=600&auto=format&fit=crop",
    link_privado: "#",
    precios: { precio_1: "650.00" },
  }
];

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const isEn = resolvedParams.locale === 'en';
  
  const query = resolvedSearch.q || "cctv"; // Default search
  
  let products = await searchSyscomProducts(query);
  const exchangeRate = await getSyscomExchangeRate();
  const isMock = products.length === 0;
  
  if (isMock) {
    products = mockProducts;
  }

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-blue/30 selection:text-white">
      <HomeHeader locale={resolvedParams.locale} />

      {/* HERO SECTION COMPACT */}
      <section className="relative overflow-hidden border-b border-brand-border bg-brand-charcoal py-12 sm:py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-premium-mesh-dark opacity-30"></div>
          <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-brand-blue/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[120%] bg-brand-cyan/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center mt-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl font-title uppercase flex items-center justify-center gap-3">
              <ShoppingBag className="h-10 w-10 text-brand-cyan" />
              Zirian <span className="text-brand-cyan">Store</span>
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-400">
              {isEn 
                ? 'Professional equipment catalog. Explore high-end CCTVs, EV Chargers, Solar Panels and Enterprise Networks.'
                : 'Catálogo de equipamiento profesional. Sistemas CCTV, Cargadores EV, Paneles Solares y Redes Empresariales.'}
            </p>
            
            <form className="mt-10 max-w-md mx-auto relative group">
              <input 
                type="text" 
                name="q"
                defaultValue={resolvedSearch.q || ''}
                placeholder={isEn ? "Search products, brands, or models..." : "Buscar productos, marcas o modelos..."}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all group-hover:border-slate-600"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-brand-cyan text-brand-dark rounded-full w-10 flex items-center justify-center hover:bg-white transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Fast Links */}
      <div className="bg-slate-900 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-center">
          <Link href={`/${resolvedParams.locale}/store?q=hikvision`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-sm font-tech text-slate-300">
            <ShieldCheck className="h-4 w-4 text-brand-blue" /> CCTV & Seguridad
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=ubiquiti`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-sm font-tech text-slate-300">
            <Server className="h-4 w-4 text-brand-cyan" /> Redes Empresariales
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=cargador%20ev`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-sm font-tech text-slate-300">
            <Zap className="h-4 w-4 text-[#00FF41]" /> Cargadores EV
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=ecoflow`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-brand-cyan hover:text-black transition-colors text-sm font-tech text-slate-300 border border-brand-cyan/20">
            <Zap className="h-4 w-4" /> Baterías EcoFlow
          </Link>
        </div>
      </div>

      {/* MAIN CATALOG */}
      <main className="relative overflow-hidden bg-brand-dark min-h-[500px]">
        {/* Dynamic Background for Products */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-premium-mesh-dark opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Main Products Container */}
        <div className="lg:col-span-3">
          {/* Free Shipping Banner */}
          <div className="mb-8 bg-brand-cyan/10 border border-brand-cyan/30 p-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
            <Truck className="h-6 w-6 text-brand-cyan animate-bounce" />
            <p className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-title text-center">
              {resolvedParams.locale === 'en' ? 'Free Shipping Nationwide on All Orders!' : '¡Envíos gratis a toda la república en todos los pedidos!'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link href={`/${resolvedParams.locale}/store/${product.producto_id}`} key={product.producto_id} className="block group">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-brand-cyan/50 hover:shadow-[0_0_20px_rgba(0,163,255,0.1)] transition-all flex flex-col h-full">
                  <div className="aspect-square bg-white relative p-4 flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.img_portada || 'https://via.placeholder.com/400?text=No+Image'} 
                      alt={product.titulo}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  {product.marca && (
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
                      {product.marca}
                    </div>
                  )}
                  {((product.existencia?.nuevo ?? 0) > 0 || (product.total_existencia ?? 0) > 0) && (
                    <div className="absolute bottom-2 left-2 bg-slate-900 border border-[#00FF41]/30 text-[#00FF41] text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md">
                      <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-pulse shadow-[0_0_8px_#00FF41]"></div>
                      {product.existencia?.nuevo || product.total_existencia} en stock
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-brand-cyan font-mono mb-2">{product.modelo}</p>
                  <h3 className="text-sm font-bold text-slate-200 line-clamp-3 mb-4 group-hover:text-brand-cyan transition-colors flex-1">
                    {product.titulo}
                  </h3>
                  
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{isEn ? 'Price' : 'Precio'}</p>
                      <p className="text-lg font-bold font-tech text-white">
                        {product.precios?.precio_lista 
                          ? `$${(parseFloat(product.precios.precio_lista) * exchangeRate * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`
                          : (isEn ? 'Ask Quote' : 'Solicitar')}
                      </p>
                      {product.precios?.precio_lista && (
                        <p className="text-[9px] text-slate-500 uppercase">{isEn ? 'Tax Included' : 'IVA Incluido'}</p>
                      )}
                    </div>
                    <button className="bg-slate-800 group-hover:bg-brand-cyan group-hover:text-black text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <SidebarEcommerceWidget locale={resolvedParams.locale} />
          </div>
        </div>
        
        </div>
      </main>

      <HomeFooter locale={resolvedParams.locale} />
    </div>
  );
}
