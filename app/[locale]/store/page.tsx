import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';
import { searchSyscomProducts, SyscomProduct, getSyscomExchangeRate, getSyscomProductsByIds } from '@/lib/syscom';
import { getSyscomSettings } from '@/app/actions/syscom-settings';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search, ShoppingBag, ArrowRight, ShieldCheck, Zap, Server, Truck, Wind, Star, Key } from 'lucide-react';
import { SidebarEcommerceWidget } from '@/components/store/sidebar-ecommerce-widget';
import { FeaturedProductWidget } from '@/components/store/featured-product-widget';
import { AuthProvider } from '@/components/store/auth-provider';
import { FeaturedSection } from '@/components/store/featured-section';
import { FeaturedButton } from '@/components/store/featured-button';
import { auth } from '@/auth';
import { BlacklistButton } from '@/components/store/blacklist-button';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const isEn = resolvedParams.locale === 'en';
  const title = isEn ? "Store - Smart Home & EV Chargers | Zirian" : "Tienda de Domótica y Cargadores EV | Zirian";
  const desc = isEn ? "Buy top-tier smart home, security, and EV charger equipment in Los Cabos." : "Equipamiento de alta gama para hogares inteligentes, seguridad y cargadores de autos eléctricos en Los Cabos.";
  
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://zirian.com/${resolvedParams.locale}/store`,
    }
  };
}

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
  
  const session = await auth();
  const isAdmin = session?.user?.role?.toLowerCase() === 'admin' || session?.user?.role?.toLowerCase() === 'superadmin';
  
  const config = await getSyscomSettings();
  
  const allExceptionalProducts = config.models.length > 0 ? await getSyscomProductsByIds(config.models) : [];
  const categoryMap = config.categoryMap || {};
  
  // Featured products are strictly those in featuredModels
  const featuredProducts = config.featuredModels && config.featuredModels.length > 0 
    ? await getSyscomProductsByIds(config.featuredModels)
    : [];
  
  const injectedProducts = allExceptionalProducts.filter(p => {
    const cat = categoryMap[p.producto_id] || categoryMap[p.modelo] || "";
    return cat === query.toLowerCase();
  });
  
  const isHomepage = !resolvedSearch.q;
  
  let products = await searchSyscomProducts(query);
  if (query.toLowerCase() === "cargador ev") {
    products = products.filter(p => !p.marca?.toUpperCase().includes("ECOFLOW"));
  }
  
  // Prepend injected products to the main products list
  if (injectedProducts.length > 0) {
    // Filter out duplicates just in case Syscom also returned them
    const injectedIds = new Set(injectedProducts.map(p => String(p.producto_id)));
    products = products.filter(p => !injectedIds.has(String(p.producto_id)));
    products = [...injectedProducts, ...products];
  }
  
  const exchangeRate = await getSyscomExchangeRate();
  
  console.log(`[STORE PAGE] Query: "${query}", Products Found: ${products.length}, Featured: ${featuredProducts.length}, Injected: ${injectedProducts.length}`);

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
            <h1 className="sr-only">
              {isEn ? 'Store for EV Chargers, Smart Home and Enterprise Networks' : 'Tienda de Cargadores EV, Domótica y Redes Empresariales'}
            </h1>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl font-title uppercase flex items-center justify-center gap-3">
              <ShoppingBag className="h-10 w-10 text-brand-cyan" />
              Zirian <span className="text-brand-cyan">Store</span>
            </h2>
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
          <Link href={`/${resolvedParams.locale}/store?q=cctv`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-sm font-tech text-slate-300">
            <ShieldCheck className="h-4 w-4 text-brand-blue" /> CCTV & Seguridad
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=redes`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-sm font-tech text-slate-300">
            <Server className="h-4 w-4 text-brand-cyan" /> Redes
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=acceso`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-sm font-tech text-slate-300">
            <Key className="h-4 w-4 text-yellow-500" /> Acceso
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=cargador%20ev`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-sm font-tech text-slate-300">
            <Zap className="h-4 w-4 text-[#00FF41]" /> Cargadores de Vehículos
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=ecoflow`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-brand-cyan hover:text-black transition-colors text-sm font-tech text-slate-300 border border-brand-cyan/20">
            <Zap className="h-4 w-4" /> Baterías EcoFlow
          </Link>
          <Link href={`/${resolvedParams.locale}/store?q=aufit`} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-200 hover:text-black transition-colors text-sm font-tech text-slate-300 border border-slate-300/20">
            <Wind className="h-4 w-4" /> Aires Acondicionados
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
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 relative z-10">
          
          {isHomepage && featuredProducts.length > 0 && (
            <FeaturedSection 
              products={featuredProducts} 
              isEn={isEn} 
              exchangeRate={exchangeRate} 
              isAdmin={isAdmin} 
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Products Container */}
          <div className="lg:col-span-3">
          {/* Free Shipping Banner */}
          <div className="mb-8 bg-brand-cyan/10 border border-brand-cyan/30 p-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
            <Truck className="h-6 w-6 text-brand-cyan animate-bounce" />
            <p className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-title text-center">
              {resolvedParams.locale === 'en' ? 'Free Shipping Nationwide on All Orders!' : '¡Envíos gratis a toda la república en todos los pedidos!'}
            </p>
          </div>
          
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-center min-h-[400px]">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-title uppercase tracking-wider">
                {isEn ? 'No products found' : 'No se encontraron productos'}
              </h3>
              <p className="text-slate-400 max-w-md mt-4 text-xs">
                {isEn 
                  ? 'Try searching with a different keyword or check if the product brand is allowed in the administration whitelist.'
                  : 'Intenta buscar con otra palabra clave o verifica si la marca del producto está permitida en la configuración del administrador.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link href={`/${resolvedParams.locale}/store/${product.producto_id}`} key={product.producto_id} className="block group">
                <div className="bg-slate-900/80 border border-brand-blue/30 rounded-2xl overflow-hidden hover:border-brand-cyan hover:shadow-[0_0_20px_rgba(0,163,255,0.2)] transition-all flex flex-col h-full relative">
                  {isAdmin && (
                    <>
                      <BlacklistButton productId={product.producto_id} />
                      <FeaturedButton 
                        productId={product.producto_id} 
                        isFeatured={config.featuredModels.includes(String(product.producto_id).toUpperCase())} 
                      />
                    </>
                  )}
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
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <AuthProvider>
              <SidebarEcommerceWidget locale={resolvedParams.locale} />
            </AuthProvider>
            <FeaturedProductWidget locale={resolvedParams.locale} />
          </div>
        </div>
        </div>
        
          {!isHomepage && featuredProducts.length > 0 && (
            <FeaturedSection 
              products={featuredProducts} 
              isEn={isEn} 
              exchangeRate={exchangeRate} 
              isAdmin={isAdmin} 
            />
          )}

        </div>
      </main>


      <HomeFooter locale={resolvedParams.locale} />
    </div>
  );
}
