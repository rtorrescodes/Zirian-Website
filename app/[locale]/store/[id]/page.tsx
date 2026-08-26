import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';
import { getSyscomProduct, searchSyscomProducts, SyscomProduct, getSyscomExchangeRate } from '@/lib/syscom';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Download, Mail, Truck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/store/add-to-cart-button';
import { ProductImageGallery } from '@/components/store/product-image-gallery';
import { Metadata } from 'next';
import { SidebarEcommerceWidget } from '@/components/store/sidebar-ecommerce-widget';
import { auth } from '@/auth';
import { BlacklistButton } from '@/components/store/blacklist-button';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const id = resolvedParams.id;
  const isEn = locale === 'en';
  
  const session = await auth();
  const isAdmin = (session?.user as any)?.role?.toLowerCase() === 'admin' || (session?.user as any)?.role?.toLowerCase() === 'superadmin';
  
  let product: SyscomProduct | null = null;
  
  product = await getSyscomProduct(id);

  const exchangeRate = await getSyscomExchangeRate();

  if (!product) {
    notFound();
  }
  
  console.log("Categorias de este producto:", product.categorias);

  const precioVenta = product.precios?.precio_lista 
    ? parseFloat(product.precios.precio_lista) * exchangeRate * 1.16 
    : 0;

  let mainTitle = product.titulo;
  let subTitle = "";
  
  if (product.titulo.includes(' / ')) {
    const parts = product.titulo.split(' / ').map(p => p.trim());
    let currentLen = parts[0].length;
    let splitAt = 1;
    
    for (let i = 1; i < parts.length; i++) {
      if (currentLen > 80) break;
      currentLen += parts[i].length + 3; // account for " / "
      splitAt = i + 1;
    }
    
    if (splitAt < parts.length) {
      mainTitle = parts.slice(0, splitAt).join(' / ');
      subTitle = parts.slice(splitAt).join(' / ');
    }
  } else if (product.titulo.length > 100) {
    const splitIndexDot = product.titulo.indexOf('.', 80);
    if (splitIndexDot !== -1) {
      mainTitle = product.titulo.substring(0, splitIndexDot).trim();
      subTitle = product.titulo.substring(splitIndexDot + 1).trim();
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-blue/30 selection:text-white">
      <HomeHeader locale={locale} />

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-12 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-8 flex flex-wrap items-center text-sm text-slate-400 gap-2 font-mono">
          <Link href={`/${locale}/store`} className="inline-flex items-center hover:text-brand-cyan transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEn ? 'Store' : 'Tienda'}
          </Link>
          
          {product.categorias && product.categorias.length > 0 && (
            <>
              {[...product.categorias]
                .sort((a, b) => (a.nivel || 0) - (b.nivel || 0))
                .map((cat, idx) => (
                  <div key={cat.id || idx} className="flex items-center gap-2">
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-300 capitalize">
                      {cat.nombre.toLowerCase()}
                    </span>
                  </div>
              ))}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Main Product Area */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            
            {/* Left Column Container */}
            <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/20">
              {/* Image Viewer */}
              <div className="bg-white p-4 lg:p-6 flex items-center justify-center min-h-[400px] relative">
                <ProductImageGallery 
                  portada={product.img_portada || 'https://via.placeholder.com/600?text=No+Image'} 
                  title={mainTitle} 
                  images={product.imagenes}
                />
                {isAdmin && (
                  <BlacklistButton productId={product.producto_id} />
                )}
                {product.marca && (
                  <div className="absolute top-6 left-6 bg-slate-900 text-white text-xs uppercase font-bold px-3 py-1.5 rounded-md tracking-widest shadow-lg">
                    {product.marca}
                  </div>
                )}
                {((product.existencia?.nuevo ?? 0) > 0 || (product.total_existencia ?? 0) > 0) && (
                  <div className="absolute bottom-6 left-6 bg-slate-900 border border-[#00FF41]/30 text-[#00FF41] text-xs uppercase font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse shadow-[0_0_10px_#00FF41]"></div>
                    Disponibilidad: {product.existencia?.nuevo || product.total_existencia} pzas.
                  </div>
                )}
              </div>

              {/* Added Value Widget (Fills remaining empty space) */}
              <div className="flex-1 p-6 lg:p-8 bg-slate-900/60 hidden lg:flex flex-col justify-center">
                <h4 className="text-base font-bold text-white mb-5 uppercase tracking-wider font-mono text-brand-cyan">Asesoría e Instalación</h4>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="h-6 w-6 text-brand-blue flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 leading-relaxed">
                      Si este producto lo requiere con instalación en <strong>Baja California Sur</strong>, favor de cotizar y comprarlo directamente con nosotros para poder asesorarlo y revisar muy bien todo lo necesario para su instalación.
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-[#00FF41] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 leading-relaxed">Equipos originales y garantía Zirian directa en todos nuestros servicios de integración y domótica.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-6">
                <span className="text-brand-cyan font-mono text-sm uppercase tracking-wider">{product.modelo}</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 leading-tight">
                  {mainTitle}
                </h1>
                {subTitle && (
                  <p className="text-sm text-slate-400 mt-4 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    {subTitle}
                  </p>
                )}
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50">
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="h-6 w-6 text-[#00FF41]" />
                    <p className="text-sm text-slate-300">
                      {isEn ? 'Official Authorized Distributor Warranty' : 'Garantía Oficial de Distribuidor Autorizado'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Truck className="h-6 w-6 text-brand-cyan" />
                    <p className="text-sm text-slate-300 font-bold">
                      {isEn ? 'Free Shipping Nationwide' : 'Envío Gratis a toda la República'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-700/50 pt-4 mt-4">
                  <div className="min-w-fit">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{isEn ? 'Pricing' : 'Precio'}</p>
                    <p className="text-xl sm:text-2xl font-bold font-tech text-white mt-1 whitespace-nowrap">
                      {product.precios?.precio_lista 
                        ? `$${precioVenta.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`
                        : (isEn ? 'Custom Quote' : 'Cotización a medida')}
                    </p>
                    {product.precios?.precio_lista && (
                      <p className="text-[10px] text-slate-500 uppercase mt-1">{isEn ? 'Tax Included' : 'IVA Incluido'}</p>
                    )}
                  </div>
                  <div className="w-full sm:w-auto">
                    <AddToCartButton 
                      productId={product.producto_id}
                      title={product.titulo}
                      brand={product.marca || null}
                      model={product.modelo || null}
                      image={product.img_portada || null}
                      priceMxn={precioVenta}
                      locale={locale}
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1">
                <h3 className="text-lg font-bold font-title uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                  {isEn ? 'Key Features' : 'Características Principales'}
                </h3>
                {product.caracteristicas && product.caracteristicas.length > 0 ? (
                  <ul className="space-y-3">
                    {product.caracteristicas.slice(0, 8).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300 leading-relaxed text-left">{feat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm italic">
                    {isEn ? 'No detailed features available.' : 'Hoja de características no disponible.'}
                  </p>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>

          {/* SIDEBAR WIDGET */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 h-fit">
              <SidebarEcommerceWidget locale={locale} />
              
              {/* Trust/Support Banner */}
              <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(0,210,255,0.05)] mt-8">
                <p className="text-xs text-brand-cyan font-tech uppercase tracking-wider mb-2">
                  {isEn ? 'Need assistance?' : '¿Necesitas ayuda?'}
                </p>
                <p className="text-slate-300 text-sm mb-4">
                  {isEn ? 'Our engineers are ready to help you plan your installation.' : 'Nuestros ingenieros están listos para ayudarte a planear tu instalación.'}
                </p>
                <Link href={`/${locale}#contacto`} className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs uppercase tracking-wider transition-colors">
                  {isEn ? 'Contact Support' : 'Contactar Soporte'}
                </Link>
              </div>
            </div>
          </aside>
          
        </div>
      </main>

      <HomeFooter locale={locale} />
    </div>
  );
}
