import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { getSyscomSettings } from '@/app/actions/syscom-settings';
import { getSyscomProductsByIds, getSyscomExchangeRate } from '@/lib/syscom';

export async function FeaturedProductWidget({ locale = 'es' }: { locale?: string }) {
  const config = await getSyscomSettings();
  const featuredIds = config.featuredModels || [];
  
  if (featuredIds.length === 0) {
    return null;
  }
  
  // Pick a random ID
  const randomId = featuredIds[Math.floor(Math.random() * featuredIds.length)];
  const products = await getSyscomProductsByIds([randomId]);
  const product = products[0];
  
  if (!product) return null;
  
  const exchangeRate = await getSyscomExchangeRate();
  const pVenta = product.precios?.precio_lista 
    ? parseFloat(product.precios.precio_lista) * exchangeRate * 1.16 
    : 0;

  const isEn = locale === 'en';
  
  let mainTitle = product.titulo;
  if (product.titulo.length > 80) {
    const splitIndexDot = product.titulo.indexOf('.', 60);
    if (splitIndexDot !== -1) {
      mainTitle = product.titulo.substring(0, splitIndexDot).trim();
    } else {
      mainTitle = product.titulo.substring(0, 80).trim() + '...';
    }
  }

  return (
    <div className="mt-8 bg-slate-900/60 border border-brand-cyan/20 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,163,255,0.1)] relative group">
      <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg flex items-center gap-1">
        <Star className="w-3 h-3 fill-white" /> {isEn ? 'Featured' : 'Destacado'}
      </div>
      
      <Link href={`/${locale}/store/${product.producto_id}`} className="block">
        <div className="aspect-video bg-white relative p-4 flex items-center justify-center overflow-hidden border-b border-brand-blue/30">
          <img 
            src={product.img_portada || 'https://via.placeholder.com/400?text=No+Image'} 
            alt={product.titulo}
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <div className="p-5 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
          <p className="text-[10px] text-brand-cyan font-mono mb-2 line-clamp-1">{product.modelo}</p>
          <h3 className="text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-brand-cyan transition-colors leading-relaxed mb-4">
            {mainTitle}
          </h3>
          
          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-lg font-bold text-white font-tech">
                {pVenta > 0 
                  ? `$${pVenta.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                  : 'Cotizar'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-brand-cyan transition-colors">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
