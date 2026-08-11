const fs = require('fs');

const createBilingualHero = () => {
  const content = `'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const bgImages = [
  "/assets/images/hero_ev_charger.jpg",
  "/assets/images/smart_home_savant.jpg",
  "/assets/images/security_network_vps.jpg",
  "/assets/images/solar_panels_batteries.jpg",
];

export function Hero({ locale = 'es' }: { locale?: string }) {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [nextBgIndex, setNextBgIndex] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
  const [bgGridReady, setBgGridReady] = useState(false);

  const gridCols = 4;
  const gridRows = 3;

  useEffect(() => {
    setBgGridReady(true);
    const interval = setInterval(() => {
      setIsFlipped(true);
      setTimeout(() => {
        setDisableTransition(true);
        setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
        setNextBgIndex((prev) => (prev + 1) % bgImages.length);
        setIsFlipped(false);
        setTimeout(() => {
          setDisableTransition(false);
        }, 50);
      }, 1200);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="inicio" className="relative pt-20 min-h-screen flex items-center bg-black overflow-hidden">
      {/* Parallax background staggered tiles */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(0)", zIndex: 0 }}>
        {bgGridReady && (
          <div className="fixed inset-0 grid grid-cols-4 grid-rows-3 overflow-hidden">
            {Array.from({ length: gridRows }).map((_, r) =>
              Array.from({ length: gridCols }).map((_, c) => {
                const delay = (c + r) * 80; // diagonal stagger
                return (
                  <div key={\`\${r}-\${c}\`} className="relative overflow-hidden w-full h-full [perspective:1000px]">
                    <div
                      className={\`absolute w-full h-full [transform-style:preserve-3d] \${disableTransition ? "transition-none" : "transition-transform duration-600"}\`}
                      style={{
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        transitionDelay: disableTransition ? "0ms" : \`\${delay}ms\`,
                      }}
                    >
                      {/* Front Face (Current Image) */}
                      <div
                        className="absolute w-full h-full backface-hidden bg-cover bg-center opacity-65"
                        style={{
                          backgroundImage: \`url('\${bgImages[currentBgIndex]}')\`,
                          backgroundSize: \`\${gridCols * 100}% \${gridRows * 100}%\`,
                          backgroundPosition: \`\${(c / (gridCols - 1)) * 100}% \${(r / (gridRows - 1)) * 100}%\`,
                        }}
                      />
                      {/* Back Face (Next Image) */}
                      <div
                        className="absolute w-full h-full backface-hidden bg-cover bg-center opacity-65 [transform:rotateY(180deg)]"
                        style={{
                          backgroundImage: \`url('\${bgImages[nextBgIndex]}')\`,
                          backgroundSize: \`\${gridCols * 100}% \${gridRows * 100}%\`,
                          backgroundPosition: \`\${(c / (gridCols - 1)) * 100}% \${(r / (gridRows - 1)) * 100}%\`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* High-tech gradients */}
      <div className="absolute inset-0 bg-brand-dark/45 mix-blend-multiply" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" style={{ zIndex: 1 }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full py-20 lg:py-32" style={{ zIndex: 10 }}>
        <div className="max-w-3xl">
          <span className="inline-block border-l-4 border-brand-green bg-brand-charcoal text-white font-title uppercase tracking-widest text-[10px] sm:text-xs font-bold px-4 py-2 mb-6">
            {locale === 'en' ? 'Leading Electromobility and Engineering in Los Cabos' : 'Líderes en Electromovilidad e Ingeniería en Los Cabos'}
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-title uppercase">
            {locale === 'en' ? (
              <>Connecting the <span className="text-brand-cyan">Future</span></>
            ) : (
              <>Conectando el <span className="text-brand-cyan">Futuro</span></>
            )}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
            {locale === 'en' ? (
              <>Professional installation of electric vehicle chargers certified under CFE and NOM-001 standards in Los Cabos and La Paz. We work with leading brands like <strong>Tesla, <span className="text-brand-green font-bold">BYD</span>, Geely, Mercedes-Benz, Nissan, Audi</strong> and more. We connect smart home tech, Savant domotics, professional audio, networks, and cutting-edge security.</>
            ) : (
              <>Instalación profesional de cargadores para vehículos eléctricos certificada bajo normas CFE y NOM-001 en Los Cabos y La Paz. Trabajamos con marcas líderes como <strong>Tesla, <span className="text-brand-green font-bold">BYD</span>, Geely, Mercedes-Benz, Nissan, Audi</strong> y más. Conectamos tecnología residencial, domótica Savant, audio profesional, redes y seguridad de vanguardia.</>
            )}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#cotizador"
              className="rounded-full bg-brand-blue px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue/90 hover:scale-105 transition-all text-center uppercase tracking-wider font-title"
            >
              {locale === 'en' ? 'Estimate your Project' : 'Cotiza tu Proyecto'}
            </a>
            <a
              href="#contacto"
              className="rounded-full bg-brand-charcoal border border-brand-border px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-border transition-all text-center uppercase tracking-wider font-title"
            >
              {locale === 'en' ? 'Contact us' : 'Contáctanos'} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Vertical Accent Stripe */}
      <div className="hidden xl:block absolute right-0 top-0 h-full w-24 border-l border-brand-border bg-brand-charcoal/10 backdrop-blur-sm" style={{ zIndex: 10 }}>
        <span className="transform rotate-90 whitespace-nowrap text-brand-green font-title tracking-widest text-xs uppercase font-extrabold inline-block translate-y-48 translate-x-4">
          ZIRIAN ENGINEERING • LOS CABOS
        </span>
      </div>
    </section>
  );
}
`;
  fs.writeFileSync('c:/CODES/Zirian-Website/components/home/hero.tsx', content);
};

createBilingualHero();
