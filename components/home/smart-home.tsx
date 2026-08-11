'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';


export function SmartHome({ locale = 'es' }: { locale?: string }) {
  

  return (
    <>
            <section id="servicios" className="py-20 lg:py-32 bg-premium-mesh-light text-gray-900 border-y border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-dark font-title uppercase tracking-widest text-xs font-bold font-black">{locale === 'en' ? 'HIGH TECH ENGINEERING' : 'ALTA INGENIERÍA TECNOLÓGICA'}</span>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-dark uppercase tracking-wide mt-2">
              {locale === 'en' ? 'Systems and Installations in Los Cabos' : 'Sistemas e Instalaciones en Los Cabos'}
            </h2>
            <div className="h-1 w-20 bg-brand-dark mx-auto mt-4" />
            <p className="mt-4 text-gray-600">
              {locale === 'en' ? 'In addition to EV charging infrastructure, we design and install comprehensive technological solutions for residential villas, businesses, and hotel developments.' : 'Además de infraestructura de carga EV, diseñamos e instalamos soluciones tecnológicas integrales para villas residenciales, comercios y desarrollos hoteleros.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: locale === 'en' ? "Smart Home & Automation" : "Domótica y Automatización",
                tag: "Savant & RTI",
                img: "/assets/images/smart_home_savant.jpg",
                desc: locale === 'en' ? "Total control of lighting, blinds, pool, climate, and multimedia of your residence from a unified, premium, and easy-to-use interface." : "Control absoluto de iluminación, persianas, alberca, clima y multimedia de tu residencia desde una interfaz unificada, premium y fácil de usar.",
              },
              {
                title: locale === 'en' ? "Networking & IT" : "Redes y Cómputo",
                tag: locale === 'en' ? "Networks & CCTV" : "Redes & CCTV",
                img: "/assets/images/security_network_vps.jpg",
                desc: locale === 'en' ? "Enterprise-grade structured cabling, fiber links, distribution racks, and high-speed WiFi infrastructure with total coverage for smart homes." : "Cableado estructurado de grado empresarial, enlaces de fibra, racks de distribución e infraestructura WiFi de alta velocidad con cobertura total para residencias inteligentes.",
              },
              {
                title: locale === 'en' ? "Solar Panels & Batteries" : "Paneles Solares y Baterías",
                tag: locale === 'en' ? "Clean Energy" : "Energía Limpia",
                img: "/assets/images/solar_panels_batteries.jpg",
                desc: locale === 'en' ? "We design photovoltaic systems tailored to your electricity consumption so you can charge your electric car with 100% clean energy and reduce your CFE bill." : "Diseñamos sistemas fotovoltaicos a medida de tu consumo eléctrico para que cargues tu coche eléctrico con energía 100% limpia y reduzcas tu tarifa CFE.",
              },
              {
                title: locale === 'en' ? "Professional Audio" : "Audio Profesional",
                tag: "Audio Hi-Fi",
                img: "/assets/images/audio_professional.jpg",
                desc: locale === 'en' ? "Premium multi-zone sound for terraces, gardens, and pools in vacation villas, professionally calibrated for perfect acoustics." : "Sonorización premium multi-zona para terrazas, jardines y albercas en villas vacacionales, calibrados profesionalmente para una acústica perfecta.",
              },
              {
                title: locale === 'en' ? "CCTV & Intrusion Alerts" : "CCTV & Alertas de Intrusión",
                tag: locale === 'en' ? "Security" : "Seguridad",
                img: "/assets/images/cctv_security.jpg",
                desc: locale === 'en' ? "Smart security cameras with artificial motion analytics, visitor access control, and monitored alarm systems." : "Cámaras de seguridad inteligentes con analítica de movimiento artificial, control de acceso de visitantes y sistemas de alarma monitoreada.",
              },
              {
                title: locale === 'en' ? "Electric Gates" : "Portones Eléctricos",
                tag: locale === 'en' ? "Access" : "Accesos",
                img: "/assets/images/gate_automation.jpg",
                desc: locale === 'en' ? "High-speed vehicular access automation, preventive maintenance of industrial motors, and remote app opening systems." : "Automatización de accesos vehiculares de alta velocidad, mantenimiento preventivo de motores industriales y sistemas de apertura remota por app.",
              },
            ].map((s, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="h-52 overflow-hidden relative">
                  <Image
                    src={s.img}
                    alt={s.title}
                    width={400}
                    height={208}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-4 left-4 text-white font-title font-bold text-[10px] tracking-widest px-3 py-1 uppercase ${s.tag === "Energía Limpia" || s.tag === "Accesos" || s.tag === "Clean Energy" || s.tag === "Access" ? "bg-brand-greenDark" : "bg-brand-dark"}`}>
                    {s.tag}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-title text-xl font-bold uppercase tracking-wide text-brand-dark">{s.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      </>
  );
}
