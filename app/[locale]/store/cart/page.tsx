'use client';

import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { Trash2, Loader2, ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';
import Image from 'next/image';

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCart(data);
    } catch (err) {
      setError('Error loading cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCart();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const removeItem = async (itemId: string) => {
    try {
      setCart({ ...cart, items: cart.items.filter((i: any) => i.id !== itemId) });
      await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
    } catch (err) {
      fetchCart(); // Revert on fail
    }
  };

  const clearCart = async () => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to empty your cart?' : '¿Estás seguro de que quieres vaciar tu carrito?')) return;
    try {
      setCart({ ...cart, items: [] });
      await fetch('/api/cart', { method: 'DELETE' });
    } catch (err) {
      fetchCart(); // Revert on fail
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Checkout failed');
        setCheckoutLoading(false);
      }
    } catch (err) {
      setError('Error starting checkout');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark text-white flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-cyan" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col">
        <HomeHeader locale={locale} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-24">
          <ShoppingCart className="h-16 w-16 text-slate-600 mb-4" />
          <h1 className="text-2xl font-bold font-title uppercase tracking-wider mb-2">Inicia sesión para comprar</h1>
          <p className="text-slate-400 mb-6">Necesitas una cuenta para agregar productos al carrito.</p>
          <a href={`/${locale}/login`} className="bg-brand-blue hover:bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-colors">
            Ir a Iniciar Sesión
          </a>
        </main>
        <HomeFooter locale={locale} />
      </div>
    );
  }

  const items = cart?.items || [];
  const total = items.reduce((sum: number, item: any) => sum + (Number(item.priceMxn) * item.quantity), 0);

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col">
      <HomeHeader locale={locale} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-brand-cyan" />
            <h1 className="text-3xl font-bold font-title uppercase tracking-wider text-white">Tu Carrito</h1>
          </div>
          {items.length > 0 && (
            <button 
              onClick={clearCart}
              className="text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-500/30 flex items-center gap-2 uppercase tracking-wider"
            >
              <Trash2 className="h-4 w-4" />
              {locale === 'en' ? 'Empty Cart' : 'Vaciar Carrito'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-xl mx-auto py-24 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-[2.5rem] shadow-2xl mt-12">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-brand-cyan" />
            </div>
            <h2 className="text-2xl font-bold font-title uppercase tracking-wider text-white mb-2">Tu carrito está vacío</h2>
            <p className="text-slate-400 text-center mb-8 max-w-sm">Explora nuestro catálogo y encuentra los mejores productos de tecnología y automatización.</p>
            <a href={`/${locale}/store`} className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-cyan text-black px-8 py-3.5 rounded-full font-bold uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(0,163,255,0.2)] hover:shadow-[0_0_30px_rgba(0,163,255,0.4)]">
              Ir a la Tienda
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Productos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl items-center relative group">
                  <div className="h-20 w-20 bg-white rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
                    <img src={item.image || 'https://via.placeholder.com/100'} alt={item.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-white line-clamp-2">{item.title}</h3>
                    {item.brand && <p className="text-xs text-slate-500 mt-1 uppercase">{item.brand}</p>}
                    <p className="text-sm font-bold text-brand-cyan mt-1">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(item.priceMxn))} x {item.quantity}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Resumen de Compra */}
            <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-3xl h-fit sticky top-28">
              <h2 className="text-xl font-bold font-title uppercase tracking-wider text-white mb-6 border-b border-slate-800 pb-4">Resumen</h2>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total / 1.16)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IVA (16%)</span>
                  <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total - (total / 1.16))}</span>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span className="text-brand-cyan">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black font-title uppercase tracking-widest py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {checkoutLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Pagar Seguro
                    <ShieldCheck className="h-5 w-5" />
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                Pagos procesados de forma segura por Stripe
              </div>
            </div>
          </div>
        )}
      </main>

      <HomeFooter locale={locale} />
    </div>
  );
}
