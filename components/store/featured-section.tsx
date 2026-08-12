import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { BlacklistButton } from '@/components/store/blacklist-button';
import { FeaturedButton } from '@/components/store/featured-button';

export function FeaturedSection({ 
  products, 
  isEn, 
  exchangeRate, 
  isAdmin 
}: { 
  products: any[];
  isEn: boolean;
  exchangeRate: number;
  isAdmin: boolean;
}) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8 mb-16 pt-8 border-t border-slate-800">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800/50">
        <div className="p-2 bg-brand-blue/20 rounded-lg border border-brand-blue/30">
          <Star className="w-5 h-5 text-brand-blue fill-brand-blue/20" />
        </div>
        <h2 className="text-2xl font-bold text-white font-title uppercase tracking-widest">
          {isEn ? 'Featured Products' : 'Productos Destacados'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const pVenta = product.precios?.precio_lista 
            ? parseFloat(product.precios.precio_lista) * exchangeRate * 1.16 
            : 0;
          
          let mainTitle = product.titulo;
          if (product.titulo.includes(' / ')) {
            const parts = product.titulo.split(' / ').map((p: string) => p.trim());
            let currentLen = parts[0].length;
            let splitAt = 1;
            for (let i = 1; i < parts.length; i++) {
              if (currentLen > 80) break;
              currentLen += parts[i].length + 3;
              splitAt = i + 1;
            }
            if (splitAt < parts.length) {
              mainTitle = parts.slice(0, splitAt).join(' / ');
            }
          } else if (product.titulo.length > 100) {
            const splitIndexDot = product.titulo.indexOf('.', 80);
            if (splitIndexDot !== -1) {
              mainTitle = product.titulo.substring(0, splitIndexDot).trim();
            }
          }

          return (
            <Link href={`/${isEn ? 'en' : 'es'}/store/${product.producto_id}`} key={`feat-${product.producto_id}`} className="block group">
              <div className="bg-slate-900/80 border border-brand-blue/30 rounded-2xl overflow-hidden hover:border-brand-cyan hover:shadow-[0_0_20px_rgba(0,163,255,0.2)] transition-all flex flex-col h-full relative">
                {isAdmin && (
                  <>
                    <BlacklistButton productId={product.producto_id} />
                    <FeaturedButton productId={product.producto_id} isFeatured={true} />
                  </>
                )}
                <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg">
                  {isEn ? 'Featured' : 'Destacado'}
                </div>
                
                <div className="aspect-square bg-white relative p-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src={product.img_portada || 'https://via.placeholder.com/400?text=No+Image'} 
                    alt={product.titulo}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
                  <div className="mb-3 flex-1">
                    <h3 className="text-sm font-bold text-slate-200 line-clamp-3 group-hover:text-brand-cyan transition-colors leading-relaxed">
                      {mainTitle}
                    </h3>
                  </div>
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{product.modelo}</p>
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
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
