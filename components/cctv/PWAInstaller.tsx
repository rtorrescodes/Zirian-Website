'use client';

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('CCTV PWA Service Worker registrado con alcance:', reg.scope);
          })
          .catch((err) => {
            console.warn('Error al registrar Service Worker PWA:', err);
          });
      }

      // Listen for beforeinstallprompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      window.addEventListener('appinstalled', () => {
        setIsInstallable(false);
        setDeferredPrompt(null);
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSPrompt(true);
    }
  };

  if (isStandalone) {
    return null; // Already running as installed PWA!
  }

  return (
    <>
      {/* Install Button in Toolbar or Floating */}
      {(isInstallable || (isIOS && !isStandalone)) && (
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue border border-brand-blue/40 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 h-10 px-3 transition-all animate-pulse"
          title="Instalar Diseñador CCTV en Tablet / Móvil"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Instalar App</span>
        </Button>
      )}

      {installedSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          ¡App CCTV instalada con éxito!
        </div>
      )}

      {/* iOS Install Instructions Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-white relative shadow-2xl">
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue mb-4 mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-center text-base font-bold font-tech uppercase tracking-wide mb-2 text-brand-blue">
              Instalar en iPad / iPhone
            </h3>
            <p className="text-xs text-slate-300 text-center mb-6 leading-relaxed">
              Para usar el Diseñador CCTV sin conexión y en pantalla completa:
            </p>
            <ol className="text-xs text-slate-300 space-y-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha ⎋) en la barra de Safari.</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span>Desplázate y selecciona <strong>"Agregar a pantalla de inicio"</strong> (+).</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span>Toca <strong>Agregar</strong> en la esquina superior derecha.</span>
              </li>
            </ol>
            <Button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full bg-brand-blue text-slate-950 font-bold hover:bg-brand-blue/90"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
