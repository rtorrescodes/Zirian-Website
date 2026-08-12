'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { ShoppingCart, User, LogOut, LogIn, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function SidebarEcommerceWidgetInner({ locale = 'es' }: { locale: string }) {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetch('/api/cart')
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            const total = data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
            setCartCount(total);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const isLoading = status === 'loading';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8 relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-cyan/20 transition-colors duration-500"></div>

      <h3 className="font-title text-sm font-extrabold uppercase text-white tracking-widest mb-4 flex items-center gap-2">
        <User className="h-4 w-4 text-brand-cyan" />
        {locale === 'en' ? 'My Account' : 'Mi Cuenta'}
      </h3>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-800 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-800 rounded w-24"></div>
              <div className="h-2 bg-slate-800 rounded w-32"></div>
            </div>
          </div>
        </div>
      ) : session && session.user ? (
        <div className="space-y-5 relative z-10">
          <div className="flex items-center gap-3">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name || 'User'} className="h-10 w-10 rounded-full border-2 border-brand-cyan shadow-[0_0_10px_rgba(0,163,255,0.2)]" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-brand-cyan shadow-[0_0_10px_rgba(0,163,255,0.2)]">
                <User className="h-5 w-5 text-brand-cyan" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
              <button 
                onClick={() => signOut()}
                className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 mt-1 transition-colors"
              >
                <LogOut className="h-3 w-3" />
                {locale === 'en' ? 'Log out' : 'Cerrar sesión'}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800/80 w-full"></div>

          <Link 
            href={`/${locale}/store/cart`}
            className="flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl transition-all border border-slate-700/50 hover:border-brand-cyan/50 group/cart"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-brand-cyan group-hover/cart:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#00FF41] text-[9px] font-bold text-black shadow-[0_0_10px_#00FF41]">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-200">
                {locale === 'en' ? 'Shopping Cart' : 'Carrito de Compras'}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover/cart:text-white group-hover/cart:translate-x-1 transition-all" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4 relative z-10 text-center py-2">
          <p className="text-xs text-slate-400 mb-4">
            {locale === 'en' ? 'Sign in to access your cart and orders.' : 'Inicia sesión para acceder a tu carrito y pedidos.'}
          </p>
          <Link 
            href={`/${locale}/login`}
            className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-cyan text-black px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(0,163,255,0.15)]"
          >
            <LogIn className="h-4 w-4" />
            {locale === 'en' ? 'Sign In' : 'Iniciar Sesión'}
          </Link>
        </div>
      )}
    </div>
  );
}

export function SidebarEcommerceWidget({ locale = 'es' }: { locale: string }) {
  return (
    <SessionProvider>
      <SidebarEcommerceWidgetInner locale={locale} />
    </SessionProvider>
  );
}
