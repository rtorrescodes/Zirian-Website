'use client';

import React from 'react';
import { UserButton } from './user-button';
import { CartWidget } from './cart-widget';
import { AuthProvider } from './auth-provider';

export function FloatingStoreWidget({ locale = 'es' }: { locale: string }) {
  return (
    <AuthProvider>
      <div className="fixed top-1/2 right-2 sm:right-4 md:right-6 -translate-y-1/2 z-[100] flex flex-col items-center gap-3 sm:gap-4 bg-brand-dark/90 backdrop-blur-lg border border-brand-blue/40 p-2.5 sm:p-3 rounded-full shadow-[0_0_30px_rgba(0,163,255,0.25)] hover:shadow-[0_0_40px_rgba(0,163,255,0.4)] transition-all">
        <UserButton locale={locale} />
        <div className="w-6 sm:w-8 h-px bg-slate-700/60"></div>
        <CartWidget locale={locale} />
      </div>
    </AuthProvider>
  );
}
