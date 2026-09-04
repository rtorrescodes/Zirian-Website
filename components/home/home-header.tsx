"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartWidget } from "@/components/store/cart-widget";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AuthProvider } from "@/components/store/auth-provider";

export function HomeHeader({ locale = 'es' }: { locale?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
      } else {
        setHeaderScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AuthProvider>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          headerScrolled
            ? "shadow-lg bg-brand-dark border-b border-brand-border"
            : "bg-brand-dark/95 border-b border-brand-border/40 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
              <Image 
                src="/assets/images/logo.png" 
                alt="Zirian Logo" 
                width={140} 
                height={40}
                className="h-10 w-auto hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          <div className="flex-1 hidden xl:flex justify-center">
            <nav className="flex space-x-3 2xl:space-x-7 items-center font-title uppercase tracking-wider text-xs 2xl:text-sm font-bold">
              <Link href={`/${locale}#cargadores`} className="text-gray-300 hover:text-brand-blue transition-colors whitespace-nowrap">{locale === 'en' ? 'EV Chargers' : 'Cargadores EV'}</Link>
              <Link href={`/${locale}#climatizacion`} className="text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">{locale === 'en' ? 'HVAC & AC' : 'Climas AUFIT'}</Link>
              <Link href={`/${locale}#servicios`} className="text-gray-300 hover:text-brand-blue transition-colors whitespace-nowrap">{locale === 'en' ? 'Engineering & Smart Home' : 'Domótica'}</Link>
              <Link href={`/${locale}/store`} className="text-brand-cyan hover:text-white transition-colors whitespace-nowrap">{locale === 'en' ? 'Store' : 'Tienda'}</Link>
              <Link href={`/${locale}#cotizador`} className="text-gray-300 hover:text-brand-blue transition-colors whitespace-nowrap">{locale === 'en' ? 'Estimate' : 'Cotizar'}</Link>
              <Link href={`/${locale}/blog`} className="text-gray-300 hover:text-brand-blue transition-colors whitespace-nowrap">Blog</Link>
            </nav>
          </div>

          <div className="hidden xl:flex items-center space-x-4">
            <Link
              href={`/${locale}#contacto`}
              className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-5 py-2 font-title uppercase tracking-widest text-[10px] 2xl:text-xs font-black transition-all duration-300 hover:scale-105 inline-block rounded-lg whitespace-nowrap"
            >
              {locale === 'en' ? 'Contact Us' : 'Contáctanos'}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="flex items-center xl:hidden gap-2">
            <CartWidget locale={locale} />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none p-2 flex items-center"
              aria-label="Abrir Menú"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="xl:hidden bg-brand-dark/98 border-b border-brand-border/80 font-title uppercase tracking-wider text-base font-bold py-4 px-6 flex flex-col space-y-4">
            <Link
              href={`/${locale}#cargadores`}
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              {locale === 'en' ? 'EV Chargers' : 'Cargadores EV'}
            </Link>
            <Link
              href={`/${locale}#climatizacion`}
              onClick={() => setMenuOpen(false)}
              className="text-cyan-400 hover:text-cyan-300 py-2 border-b border-brand-border/40 transition-colors"
            >
              {locale === 'en' ? 'HVAC & AC' : 'Climatización AUFIT'}
            </Link>
            <Link
              href={`/${locale}#servicios`}
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              {locale === 'en' ? 'Engineering & Smart Home' : 'Ingeniería & Domótica'}
            </Link>
            <Link
              href={`/${locale}/store`}
              onClick={() => setMenuOpen(false)}
              className="text-brand-cyan hover:text-white py-2 border-b border-brand-border/40 transition-colors"
            >
              {locale === 'en' ? 'Store' : 'Tienda'}
            </Link>
            <Link
              href={`/${locale}#cotizador`}
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              {locale === 'en' ? 'Estimate' : 'Cotizar'}
            </Link>
            <Link
              href={`/${locale}/blog`}
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              Blog
            </Link>
            <Link
              href={`/${locale}#contacto`}
              onClick={() => setMenuOpen(false)}
              className="text-brand-green py-2 border-b border-brand-border/40 transition-colors"
            >
              {locale === 'en' ? 'Contact' : 'Contacto'}
            </Link>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </header>
    </AuthProvider>
  );
}
