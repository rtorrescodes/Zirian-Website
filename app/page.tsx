"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Images list for staggered background grid rotation
const bgImages = [
  "/assets/images/hero_ev_charger.jpg",
  "/assets/images/smart_home_savant.jpg",
  "/assets/images/security_network_vps.jpg",
  "/assets/images/solar_panels_batteries.jpg",
];

export default function LandingPage() {
  // Navigation Mobile Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Estimator Form States
  const [calcStep, setCalcStep] = useState(1);
  const [calcForm, setCalcForm] = useState({
    marca_ev: "",
    tipo_instalacion: "",
    distancia_centro_carga: "",
    nombre: "",
    telefono: "",
    email: "",
    ubicacion: "",
  });
  const [calcStatus, setCalcStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Contact Form States
  const [contactForm, setContactForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    ubicacion: "",
    mensaje: "",
  });
  const [contactStatus, setContactStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Support Ticket States
  const [ticketForm, setTicketForm] = useState({
    nombre_cliente: "",
    folio_cliente: "",
    descripcion: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ticketStatus, setTicketStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Hero Parallax Background Grid State
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [nextBgIndex, setNextBgIndex] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bgGridReady, setBgGridReady] = useState(false);

  // Grid dimensions
  const gridCols = 4;
  const gridRows = 3;

  // Scroll event handling to shrink header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
      } else {
        setHeaderScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    setBgGridReady(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Background Grid Staggered Transition effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped(true);

      // Wait for the staggering rotation to complete, then swap images and reset flip state
      setTimeout(() => {
        setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
        setNextBgIndex((prev) => (prev + 1) % bgImages.length);
        setIsFlipped(false);
      }, 1200); // 1.2s to fully flip and reset
    }, 5500); // Rotate every 5.5s

    return () => clearInterval(interval);
  }, []);

  // GTM Analytics Event Trackers
  const trackWhatsAppClick = () => {
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "whatsapp_click",
        click_time: new Date().toISOString(),
      });
    }
  };

  const trackFormSubmit = (formId: string, leadType: string) => {
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "lead_submitted",
        form_id: formId,
        lead_type: leadType,
        submission_time: new Date().toISOString(),
      });
    }
  };

  const trackTicketSubmit = () => {
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "ticket_submitted",
        submission_time: new Date().toISOString(),
      });
    }
  };

  // Estimator handlers
  const handleCalcRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalcForm({ ...calcForm, [e.target.name]: e.target.value });
  };

  const handleCalcInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalcForm({ ...calcForm, [e.target.name]: e.target.value });
  };

  const goCalcNext = (step: number) => {
    // Validation
    if (currentStepValueEmpty()) {
      alert("Por favor, seleccione una opción.");
      return;
    }
    setCalcStep(step);
  };

  const currentStepValueEmpty = () => {
    if (calcStep === 1) return !calcForm.marca_ev;
    if (calcStep === 2) return !calcForm.tipo_instalacion;
    if (calcStep === 3) return !calcForm.distancia_centro_carga;
    return false;
  };

  const handleCalcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcStatus({ type: "loading", message: "PROCESANDO ESTIMACIÓN..." });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...calcForm,
          tipo_lead: "Cotización Cualificada",
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setCalcStatus({
          type: "success",
          message: `¡Cálculo Exitoso! ${resData.message}`,
        });
        setCalcForm({
          marca_ev: "",
          tipo_instalacion: "",
          distancia_centro_carga: "",
          nombre: "",
          telefono: "",
          email: "",
          ubicacion: "",
        });
        setCalcStep(1);
        trackFormSubmit("calculator-form", "Cotización Cualificada");
      } else {
        setCalcStatus({
          type: "error",
          message: resData.error || "Ocurrió un error. Intente de nuevo.",
        });
      }
    } catch (err) {
      setCalcStatus({
        type: "error",
        message: "Error al enviar la solicitud. Verifique su conexión.",
      });
    }
  };

  // Contact Form Handlers
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus({ type: "loading", message: "ENVIANDO REGISTRO..." });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactForm,
          tipo_lead: "Contacto Directo",
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setContactStatus({
          type: "success",
          message: `¡Listo! ${resData.message}`,
        });
        setContactForm({
          nombre: "",
          telefono: "",
          email: "",
          ubicacion: "",
          mensaje: "",
        });
        trackFormSubmit("contact-form", "Contacto Directo");
      } else {
        setContactStatus({
          type: "error",
          message: resData.error || "Error al guardar los datos.",
        });
      }
    } catch (err) {
      setContactStatus({
        type: "error",
        message: "Error de red. No se pudo conectar con el servidor.",
      });
    }
  };

  // Support Ticket Form Handlers
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus({ type: "loading", message: "ENVIANDO TICKET DE SOPORTE..." });

    try {
      const formData = new FormData();
      formData.append("nombre_cliente", ticketForm.nombre_cliente);
      formData.append("folio_cliente", ticketForm.folio_cliente);
      formData.append("descripcion", ticketForm.descripcion);

      if (fileInputRef.current && fileInputRef.current.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0]);
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setTicketStatus({
          type: "success",
          message: `¡Ticket Abierto! ${resData.message}`,
        });
        setTicketForm({
          nombre_cliente: "",
          folio_cliente: "",
          descripcion: "",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        trackTicketSubmit();
      } else {
        setTicketStatus({
          type: "error",
          message: resData.error || "Error al levantar el reporte.",
        });
      }
    } catch (err) {
      setTicketStatus({
        type: "error",
        message: "Error al subir el ticket. Compruebe el tamaño de su archivo.",
      });
    }
  };

  return (
    <div className="bg-brand-dark text-gray-200 font-sans antialiased overflow-x-hidden w-full">
      
      {/* ==========================================
           HEADER & NAV
           ========================================== */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          headerScrolled
            ? "shadow-lg bg-brand-dark border-b border-brand-border"
            : "bg-brand-dark/95 border-b border-brand-border/40 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2">
            <Image
              src="/assets/images/logo.png"
              alt="Logo Zirian"
              width={160}
              height={44}
              priority
              className="h-8 sm:h-10 md:h-11 w-auto object-contain"
            />
          </a>

          <nav className="hidden lg:flex space-x-6 xl:space-x-8 items-center font-title uppercase tracking-wider text-sm font-bold">
            <a href="#inicio" className="text-white hover:text-brand-blue transition-colors">Inicio</a>
            <a href="#cargadores" className="text-gray-300 hover:text-brand-blue transition-colors">Cargadores EV</a>
            <a href="#servicios" className="text-gray-300 hover:text-brand-blue transition-colors">Ingeniería & Domótica</a>
            <a href="#cotizador" className="text-gray-300 hover:text-brand-blue transition-colors">Cotizar</a>
            <a href="#soporte" className="text-gray-300 hover:text-brand-blue transition-colors">Garantías</a>
          </nav>

          <div className="hidden lg:block">
            <a
              href="#contacto"
              className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-6 py-2.5 font-title uppercase tracking-widest text-xs font-black transition-all duration-300 hover:scale-105 inline-block rounded-lg"
            >
              Contáctanos
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-white focus:outline-none p-2"
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

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="lg:hidden bg-brand-dark/98 border-b border-brand-border/80 font-title uppercase tracking-wider text-base font-bold py-4 px-6 flex flex-col space-y-4">
            <a
              href="#inicio"
              onClick={() => setMenuOpen(false)}
              className="text-white hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              Inicio
            </a>
            <a
              href="#cargadores"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              Cargadores EV
            </a>
            <a
              href="#servicios"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              Ingeniería & Domótica
            </a>
            <a
              href="#cotizador"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              Cotizar
            </a>
            <a
              href="#soporte"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-brand-blue py-2 border-b border-brand-border/40 transition-colors"
            >
              Garantías
            </a>
            <a
              href="#contacto"
              onClick={() => setMenuOpen(false)}
              className="bg-brand-green text-brand-dark text-center py-3 font-black transition-colors rounded-lg block"
            >
              Contáctanos
            </a>
          </div>
        )}
      </header>

      {/* ==========================================
           HERO SECTION (Rotantes 3D Grid Tiles)
           ========================================== */}
      <section id="inicio" className="relative pt-20 min-h-screen flex items-center bg-black overflow-hidden">
        {/* Parallax background staggered tiles */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(0)", zIndex: 0 }}>
          {bgGridReady && (
            <div className="fixed inset-0 grid grid-cols-4 grid-rows-3 overflow-hidden">
              {Array.from({ length: gridRows }).map((_, r) =>
                Array.from({ length: gridCols }).map((_, c) => {
                  const delay = (c + r) * 80; // diagonal stagger
                  return (
                    <div key={`${r}-${c}`} className="relative overflow-hidden w-full h-full [perspective:1000px]">
                      <div
                        className={`absolute w-full h-full [transform-style:preserve-3d] transition-transform duration-600`}
                        style={{
                          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                          transitionDelay: `${delay}ms`,
                        }}
                      >
                        {/* Front Face (Current Image) */}
                        <div
                          className="absolute w-full h-full backface-hidden bg-cover bg-center opacity-65"
                          style={{
                            backgroundImage: `url('${bgImages[currentBgIndex]}')`,
                            backgroundSize: `${gridCols * 100}% ${gridRows * 100}%`,
                            backgroundPosition: `${(c / (gridCols - 1)) * 100}% ${(r / (gridRows - 1)) * 100}%`,
                          }}
                        />
                        {/* Back Face (Next Image) */}
                        <div
                          className="absolute w-full h-full backface-hidden bg-cover bg-center opacity-65 [transform:rotateY(180deg)]"
                          style={{
                            backgroundImage: `url('${bgImages[nextBgIndex]}')`,
                            backgroundSize: `${gridCols * 100}% ${gridRows * 100}%`,
                            backgroundPosition: `${(c / (gridCols - 1)) * 100}% ${(r / (gridRows - 1)) * 100}%`,
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
              Líderes en Electromovilidad e Ingeniería en Los Cabos
            </span>

            <h1 className="font-title text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight uppercase tracking-wide">
              Alta Ingeniería en <span className="text-brand-blue">Cargadores EV</span> & Sistemas
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
              Instalación profesional de cargadores para vehículos eléctricos certificada bajo normas CFE y NOM-001 en Los Cabos y La Paz. Trabajamos con marcas líderes como <strong>Tesla, <span className="text-brand-green font-bold">BYD</span>, Geely, Mercedes-Benz, Nissan, Audi</strong> y más. Conectamos tecnología residencial, domótica Savant, audio profesional, redes y seguridad de vanguardia.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#cotizador"
                className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-4 font-title uppercase tracking-widest text-xs font-black text-center transition-all duration-300 hover:scale-105 rounded-lg"
              >
                Cotizar la instalación de mi cargador
              </a>
              <a
                href="#servicios"
                className="border border-white/40 hover:border-brand-blue hover:text-brand-blue text-white px-8 py-4 font-title uppercase tracking-widest text-xs font-bold text-center transition-all duration-300 rounded-lg"
              >
                Otros Servicios
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

      {/* ==========================================
           CERTIFICATIONS SECTION
           ========================================== */}
      <section className="bg-brand-charcoal py-8 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center justify-center p-3 border-r border-brand-border/60 last:border-0">
              <span className="text-brand-green font-title font-extrabold text-lg sm:text-2xl tracking-wide">CFE</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-title uppercase tracking-widest mt-1">Normativa Oficial</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 border-r border-brand-border/60 last:border-0">
              <span className="text-white font-title font-extrabold text-lg sm:text-2xl tracking-wide">NOM-001</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-title uppercase tracking-widest mt-1">Seguridad Eléctrica</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 border-r border-brand-border/60 last:border-0">
              <span className="text-brand-blue font-title font-extrabold text-lg sm:text-2xl tracking-wide">1 AÑO</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-title uppercase tracking-widest mt-1">Garantía Mano de Obra</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           BRANDS MARQUEE (Cintillo de Marcas)
           ========================================== */}
      <section className="py-8 bg-[#0a0d14] border-b border-brand-border overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <span className="text-gray-500 font-title uppercase tracking-widest text-[9px] font-extrabold">TECNOLOGÍA E INFRAESTRUCTURA DE VANGUARDIA</span>
        </div>
        <div className="relative w-full flex overflow-x-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0d14] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0d14] to-transparent z-10 pointer-events-none" />

          {/* Scrolling Track */}
          <div className="animate-marquee flex items-center space-x-16">
            <div className="flex items-center space-x-16">
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">TESLA</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider text-brand-green">BYD</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">GOOGLE</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CENTOS</span>
              <span className="text-white/45 font-title text-sm font-black tracking-widest">SAVANT</span>
              <span className="text-white/45 font-title text-sm font-black tracking-widest">LUTRON</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">UBIQUITI</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CISCO</span>
            </div>
            <div className="flex items-center space-x-16">
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">TESLA</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider text-brand-green">BYD</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">GOOGLE</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CENTOS</span>
              <span className="text-white/45 font-title text-sm font-black tracking-widest">SAVANT</span>
              <span className="text-white/45 font-title text-sm font-black tracking-widest">LUTRON</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">UBIQUITI</span>
              <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CISCO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           EV CHARGERS SECTION
           ========================================== */}
      <section id="cargadores" className="py-20 lg:py-32 bg-premium-mesh-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-blue font-title uppercase tracking-widest text-xs font-bold">INFRAESTRUCTURA DE CARGA</span>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-wide mt-2">
              Especialistas en Cargadores Eléctricos
            </h2>
            <div className="h-1 w-20 bg-brand-blue mx-auto mt-4" />
            <p className="mt-4 text-gray-400">
              Garantizamos instalaciones eléctricas seguras y optimizadas para proteger la vida útil de tu batería y tu hogar en Los Cabos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-title text-2xl lg:text-3xl font-extrabold text-white uppercase tracking-wide">
                Ingeniería Compatible con Todas las Marcas
              </h3>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Instalamos cargadores EV en viviendas residenciales, condominios, hoteles y estacionamientos comerciales. Conectamos los principales estándares y marcas del mercado:
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-8">
                {["Tesla", "BYD", "Geely", "Volvo", "BMW", "Porsche", "Audi", "Hyundai"].map((b) => (
                  <div key={b} className="bg-brand-charcoal border border-brand-border p-4 flex flex-col items-center justify-center rounded">
                    <span className={`font-title font-bold text-xs uppercase tracking-widest ${b === "BYD" || b === "Audi" ? "text-brand-green" : b === "Geely" || b === "BMW" ? "text-brand-blue" : "text-white"}`}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-brand-charcoal border-l-4 border-brand-blue p-5">
                <h4 className="font-title text-sm font-bold uppercase text-white tracking-widest">Políticas de Garantía Zirian</h4>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Ofrecemos <strong>1 año de garantía en mano de obra</strong> realizada por nuestros ingenieros certificados y <strong>1 año de garantía en insumos</strong> directamente por parte de nuestros proveedores.
                </p>
              </div>
            </div>

            <div className="bg-brand-charcoal border border-brand-border p-8 relative overflow-hidden group rounded-xl">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all" />

              <span className="text-xs text-brand-blue font-title font-bold uppercase tracking-widest">PROYECTOS COMERCIALES</span>
              <h3 className="font-title text-2xl font-extrabold text-white uppercase tracking-wide mt-2">
                Infraestructura para Hoteles, Plazas y Airbnb
              </h3>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                ¿Tienes una propiedad en alquiler vacacional o un desarrollo comercial en Los Cabos? Ofrecer carga EV aumenta la visibilidad y valor de tu propiedad de forma inmediata.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-gray-300">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-brand-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Trámites y medidores independientes ante CFE.
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-brand-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Sistemas de carga inteligente y reparto de carga dinámica.
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-brand-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Mantenimiento preventivo de subestaciones y centros de carga.
                </li>
              </ul>

              <div className="mt-8">
                <a
                  href="#cotizador"
                  className="inline-block bg-brand-green hover:bg-brand-greenDark text-brand-dark px-6 py-3 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg"
                >
                  Cualificar Proyecto B2B
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           SECONDARY SERVICES SECTION
           ========================================== */}
      <section id="servicios" className="py-20 lg:py-32 bg-premium-mesh-light text-gray-900 border-y border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-dark font-title uppercase tracking-widest text-xs font-bold font-black">ALTA INGENIERÍA TECNOLÓGICA</span>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-dark uppercase tracking-wide mt-2">
              Sistemas e Instalaciones en Los Cabos
            </h2>
            <div className="h-1 w-20 bg-brand-dark mx-auto mt-4" />
            <p className="mt-4 text-gray-600">
              Además de infraestructura de carga EV, diseñamos e instalamos soluciones tecnológicas integrales para villas residenciales, comercios y desarrollos hoteleros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Domótica y Automatización",
                tag: "Savant & RTI",
                img: "/assets/images/smart_home_savant.jpg",
                desc: "Control absoluto de iluminación, persianas, alberca, clima y multimedia de tu residencia desde una interfaz unificada, premium y fácil de usar.",
              },
              {
                title: "Redes y Cómputo",
                tag: "Redes & CCTV",
                img: "/assets/images/security_network_vps.jpg",
                desc: "Cableado estructurado de grado empresarial, enlaces de fibra, racks de distribución e infraestructura WiFi de alta velocidad con cobertura total para residencias inteligentes.",
              },
              {
                title: "Paneles Solares y Baterías",
                tag: "Energía Limpia",
                img: "/assets/images/solar_panels_batteries.jpg",
                desc: "Diseñamos sistemas fotovoltaicos a medida de tu consumo eléctrico para que cargues tu coche eléctrico con energía 100% limpia y reduzcas tu tarifa CFE.",
              },
              {
                title: "Audio Profesional",
                tag: "Audio Hi-Fi",
                img: "/assets/images/audio_professional.jpg",
                desc: "Sonorización premium multi-zona para terrazas, jardines y albercas en villas vacacionales, calibrados profesionalmente para una acústica perfecta.",
              },
              {
                title: "CCTV & Alertas de Intrusión",
                tag: "Seguridad",
                img: "/assets/images/cctv_security.jpg",
                desc: "Cámaras de seguridad inteligentes con analítica de movimiento artificial, control de acceso de visitantes y sistemas de alarma monitoreada.",
              },
              {
                title: "Portones Eléctricos",
                tag: "Accesos",
                img: "/assets/images/gate_automation.jpg",
                desc: "Automatización de accesos vehiculares de alta velocidad, mantenimiento preventivo de motores industriales y sistemas de apertura remota por app.",
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
                  <div className={`absolute top-4 left-4 text-white font-title font-bold text-[10px] tracking-widest px-3 py-1 uppercase ${s.tag === "Energía Limpia" || s.tag === "Accesos" ? "bg-brand-greenDark" : "bg-brand-dark"}`}>
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

      {/* ==========================================
           ALDDEA SHOWCASE SECTION
           ========================================== */}
      <section id="alddea" className="py-20 lg:py-32 bg-premium-mesh-dark border-b border-brand-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px] px-6 sm:px-12">
              <div className="absolute w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl text-brand-blue" />
              <div className="absolute w-60 h-60 bg-brand-green/10 rounded-full blur-3xl -bottom-10 -left-10 text-brand-green" />
              
              {/* Left Phone (Guard App) */}
              <div className="absolute -left-2 sm:left-4 bottom-2 w-28 sm:w-36 rounded-2xl overflow-hidden border border-brand-border/80 shadow-2xl z-20 transform -rotate-4 transition-all duration-500 hover:rotate-0 hover:scale-105 bg-slate-950">
                <Image
                  src="/assets/images/alddea_guard.png"
                  alt="Alddea Seguridad QR"
                  width={144}
                  height={290}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Web Dashboard Layer */}
              <div className="relative w-full rounded-xl overflow-hidden border border-brand-border/60 shadow-2xl bg-brand-charcoal/90 transform -rotate-1.5 transition-all duration-500 hover:rotate-0 hover:scale-102 z-10 mx-6 sm:mx-12">
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-brand-dark/85 border-b border-brand-border/50">
                  <div className="flex space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/70" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                    <span className="w-2 h-2 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">alddea.com • Admin</span>
                </div>
                <Image
                  src="/assets/images/alddea_dashboard.png"
                  alt="Alddea Admin Dashboard"
                  width={500}
                  height={280}
                  className="w-full h-auto object-cover opacity-95"
                />
              </div>

              {/* Right Phone (Resident App) */}
              <div className="absolute -right-2 sm:right-4 -bottom-6 w-28 sm:w-36 rounded-2xl overflow-hidden border border-brand-border/80 shadow-2xl z-20 transform rotate-4 transition-all duration-500 hover:rotate-0 hover:scale-105 bg-slate-950">
                <Image
                  src="/assets/images/alddea_mobile.png"
                  alt="Alddea Resident App"
                  width={144}
                  height={290}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="inline-flex items-center space-x-2 border border-red-500/40 bg-red-500/10 text-red-400 font-title uppercase tracking-widest text-[10px] font-bold px-3 py-1.5 rounded mb-4 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>NUEVO LANZAMIENTO • SOFTWARE</span>
              </span>
              <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-wide leading-tight">
                Gestiona tu Fraccionamiento con <span className="text-brand-green">Alddea</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-brand-blue to-brand-green mt-4 mb-6" />
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Alddea es la plataforma digital definitiva para la administración de fraccionamientos, condominios y residenciales de alta gama en Los Cabos. Automatiza las operaciones y mejora la experiencia de tus residentes desde un solo sistema integrado.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {[
                  {
                    title: "Control de Accesos QR",
                    desc: "Generación de pases digitales para visitantes integrados a casetas de seguridad.",
                  },
                  {
                    title: "Finanzas Automatizadas",
                    desc: "Recauda cuotas de mantenimiento, pagos en línea y genera reportes financieros.",
                  },
                  {
                    title: "Reservación de Amenidades",
                    desc: "Agenda para áreas comunes, canchas, casa club y servicios residenciales.",
                  },
                  {
                    title: "Votaciones y Avisos",
                    desc: "Asambleas virtuales, encuestas masivas y boletín directo a copropietarios.",
                  },
                ].map((f, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="mt-1 bg-brand-blue/10 p-1.5 text-brand-blue rounded mr-3">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-title text-sm font-bold uppercase text-white tracking-wide">{f.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <a
                  href="https://www.alddea.com"
                  target="_blank"
                  className="inline-flex items-center bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-4 font-title uppercase tracking-widest text-xs font-black transition-all duration-300 hover:scale-105 rounded-lg shadow-lg hover:shadow-brand-green/20"
                >
                  Conoce Alddea.com
                  <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
           INTERACTIVE ESTIMATOR SECTION
           ========================================== */}
      <section id="cotizador" className="py-20 lg:py-32 bg-premium-mesh-dark border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-brand-blue font-title uppercase tracking-widest text-xs font-bold">ESTIMADOR DE CARGADORES EV</span>
            <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-wide mt-2">
              Cualifica tu Proyecto de Cargador Eléctrico
            </h2>
            <p className="text-gray-400 text-sm mt-3">
              Completa el asistente interactivo en solo 30 segundos para estimar la instalación de tu cargador de auto eléctrico en Los Cabos.
            </p>
          </div>

          <div className="bg-brand-charcoal border border-brand-border p-6 sm:p-10 rounded-2xl shadow-2xl relative">
            
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-8 text-[10px] font-title uppercase tracking-widest font-extrabold text-gray-500">
              <span className={calcStep === 1 ? "text-brand-blue" : ""}>1. Vehículo</span>
              <span className={calcStep === 2 ? "text-brand-blue" : ""}>2. Instalación</span>
              <span className={calcStep === 3 ? "text-brand-blue" : ""}>3. Distancia</span>
              <span className={calcStep === 4 ? "text-brand-blue" : ""}>4. Confirmación</span>
            </div>

            <form onSubmit={handleCalcSubmit}>
              {/* Step 1 */}
              {calcStep === 1 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">¿De qué marca es tu vehículo eléctrico?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["Tesla", "BYD", "Geely", "Volvo", "BMW", "Otro"].map((brand) => (
                      <label key={brand} className="cursor-pointer block">
                        <input
                          type="radio"
                          name="marca_ev"
                          value={brand}
                          checked={calcForm.marca_ev === brand}
                          onChange={handleCalcRadioChange}
                          className="peer hidden"
                          required
                        />
                        <div className="border border-brand-border peer-checked:border-brand-blue peer-checked:bg-brand-charcoal/60 p-4 text-center rounded-xl hover:border-brand-blue transition-all">
                          <span className="block text-xs uppercase tracking-widest font-title text-white">{brand === "Otro" ? "Otro / Multimarcas" : brand}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => goCalcNext(2)}
                      className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-3 font-title uppercase tracking-widest text-xs font-black rounded-lg"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {calcStep === 2 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">¿Qué tipo de inmueble es?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { val: "Residencial Casa", title: "Casa Habitación / Villa", desc: "Cochera techada o aire libre." },
                      { val: "Condominio", title: "Condominio / Edificio", desc: "Requiere canalizaciones a áreas comunes." },
                      { val: "Comercial", title: "Comercial / Oficina", desc: "Estacionamiento para empleados o clientes." },
                      { val: "Flotilla", title: "Flotilla / Industrial", desc: "Infraestructura de alta capacidad para empresas." },
                    ].map((item) => (
                      <label key={item.val} className="cursor-pointer block">
                        <input
                          type="radio"
                          name="tipo_instalacion"
                          value={item.val}
                          checked={calcForm.tipo_instalacion === item.val}
                          onChange={handleCalcRadioChange}
                          className="peer hidden"
                          required
                        />
                        <div className="border border-brand-border peer-checked:border-brand-blue peer-checked:bg-brand-charcoal/60 p-4 rounded-xl hover:border-brand-blue transition-all">
                          <span className="block text-sm uppercase tracking-wider font-title text-white font-bold">{item.title}</span>
                          <span className="block text-[10px] text-gray-400 mt-1">{item.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCalcStep(1)}
                      className="border border-white text-white px-8 py-3 font-title uppercase tracking-widest text-xs font-bold rounded-lg"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => goCalcNext(3)}
                      className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-3 font-title uppercase tracking-widest text-xs font-black rounded-lg"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {calcStep === 3 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">Distancia aproximada al centro de carga</h3>
                  <div className="space-y-4">
                    {[
                      { val: "Corta (1-10 metros)", label: "De 1 a 10 Metros", range: "Corta distancia" },
                      { val: "Media (11-30 metros)", label: "De 11 a 30 Metros", range: "Media distancia" },
                      { val: "Larga (Mas de 30 metros)", label: "Más de 30 Metros", range: "Instalación compleja" },
                    ].map((item) => (
                      <label key={item.val} className="cursor-pointer block">
                        <input
                          type="radio"
                          name="distancia_centro_carga"
                          value={item.val}
                          checked={calcForm.distancia_centro_carga === item.val}
                          onChange={handleCalcRadioChange}
                          className="peer hidden"
                          required
                        />
                        <div className="border border-brand-border peer-checked:border-brand-blue peer-checked:bg-brand-charcoal/60 p-4 rounded-xl hover:border-brand-blue transition-all flex items-center justify-between">
                          <span className="block text-sm uppercase tracking-wider font-title text-white font-bold">{item.label}</span>
                          <span className={`text-xs font-bold font-title ${item.range === "Media distancia" ? "text-white" : "text-brand-blue"}`}>
                            {item.range}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCalcStep(2)}
                      className="border border-white text-white px-8 py-3 font-title uppercase tracking-widest text-xs font-bold rounded-lg"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => goCalcNext(4)}
                      className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-3 font-title uppercase tracking-widest text-xs font-black rounded-lg"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {calcStep === 4 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">¿A dónde enviamos tu cotización?</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Nombre Completo *</label>
                      <input
                        type="text"
                        name="nombre"
                        value={calcForm.nombre}
                        onChange={handleCalcInputChange}
                        required
                        className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Teléfono / WhatsApp *</label>
                        <input
                          type="tel"
                          name="telefono"
                          value={calcForm.telefono}
                          onChange={handleCalcInputChange}
                          required
                          className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Correo Electrónico</label>
                        <input
                          type="email"
                          name="email"
                          value={calcForm.email}
                          onChange={handleCalcInputChange}
                          className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Zona / Villa / Código Postal *</label>
                      <input
                        type="text"
                        name="ubicacion"
                        value={calcForm.ubicacion}
                        onChange={handleCalcInputChange}
                        required
                        placeholder="Ej: Palmilla, El Pedregal, Cabo San Lucas..."
                        className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setCalcStep(3)}
                      className="border border-white text-white px-8 py-3 font-title uppercase tracking-widest text-xs font-bold rounded-lg"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-3 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg"
                    >
                      Enviar y Calcular
                    </button>
                  </div>
                </div>
              )}
            </form>

            {calcStatus.type !== "idle" && (
              <div
                className={`mt-6 p-4 rounded-xl text-xs font-title uppercase tracking-wider text-center ${
                  calcStatus.type === "loading"
                    ? "bg-brand-blue/20 text-brand-blue"
                    : calcStatus.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {calcStatus.message}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
           CONTACT SECTION (Lead Capture)
           ========================================== */}
      <section id="contacto" className="py-20 lg:py-32 bg-premium-mesh-light text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-brand-dark/10 border border-brand-dark/25 text-brand-dark font-title uppercase tracking-widest text-[10px] font-bold px-3.5 py-1.5 mb-3 rounded">
                  OFICINAS Y PROYECTOS
                </span>
                <h2 className="font-title text-3xl lg:text-5xl font-extrabold text-brand-dark uppercase tracking-wide mt-1">
                  ¿Listo para Empezar?
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-brand-dark to-brand-green mt-4 mb-6" />
                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                  Agenda una visita de inspección técnica sin compromiso para tu residencia o negocio en cualquier zona de Los Cabos.
                </p>

                <div className="space-y-4">
                  <a
                    href="https://wa.me/526246220525"
                    target="_blank"
                    onClick={trackWhatsAppClick}
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group block"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-brand-dark/10 text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors mr-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">Teléfono & WhatsApp</span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">+52 624 622 0525</span>
                    </div>
                  </a>

                  <a
                    href="mailto:admin@alddea.com"
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group block"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-brand-dark/10 text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors mr-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">Correo de Contacto</span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">admin@alddea.com</span>
                    </div>
                  </a>

                  <div className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group">
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-brand-dark/10 text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors mr-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">Zonas de Cobertura</span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">Los Cabos y La Paz, BCS, México</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-300 pt-6">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Atención Inmediata de Ventas</p>
                <a
                  href="https://wa.me/526246220525"
                  target="_blank"
                  onClick={trackWhatsAppClick}
                  className="inline-flex items-center bg-brand-green hover:bg-brand-greenDark text-brand-dark px-6 py-3.5 font-title uppercase tracking-widest text-xs font-black transition-all w-full sm:w-auto justify-center rounded shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.386 9.805-9.778.001-2.612-1.013-5.068-2.859-6.915C16.37 2.062 13.924.979 11.32.979 5.922.979 1.523 5.367 1.52 10.76c-.001 1.505.4 2.97 1.161 4.264l-.999 3.65 3.754-.984c1.238.675 2.58 1.026 3.911 1.028zm10.793-6.284c-.296-.147-1.748-.863-2.019-.961-.27-.099-.467-.147-.663.148-.196.295-.761.961-.933 1.158-.172.196-.344.22-.64.073-.296-.147-1.252-.461-2.385-1.471-.881-.786-1.476-1.756-1.649-2.05-.173-.296-.018-.456.13-.603.133-.132.296-.345.444-.517.149-.172.197-.295.296-.492.099-.197.05-.369-.024-.517-.075-.147-.663-1.598-.909-2.189-.239-.575-.483-.497-.663-.506-.172-.008-.368-.01-.565-.01-.196 0-.515.073-.784.369-.27.295-1.03 1.009-1.03 2.46 0 1.452 1.055 2.855 1.202 3.053.147.197 2.078 3.174 5.034 4.451.703.303 1.252.484 1.68.621.71.226 1.356.194 1.866.118.568-.084 1.748-.713 1.994-1.402.245-.689.245-1.279.172-1.402-.074-.123-.27-.197-.567-.345z" />
                  </svg>
                  WhatsApp Ventas
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-gray-200 p-8 sm:p-10 rounded-xl shadow-md">
              <h3 className="font-title text-xl font-bold uppercase text-brand-dark tracking-wide mb-6">Envíanos un Mensaje</h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={contactForm.nombre}
                    onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                    required
                    className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">Teléfono o Celular *</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={contactForm.telefono}
                      onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                      required
                      className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">Villa, Fraccionamiento o Código Postal *</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={contactForm.ubicacion}
                    onChange={(e) => setContactForm({ ...contactForm, ubicacion: e.target.value })}
                    required
                    className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">¿Cómo te podemos ayudar? (Opcional)</label>
                  <textarea
                    name="mensaje"
                    value={contactForm.mensaje}
                    onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-dark py-4 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Solicitar Información
                  </button>
                </div>
              </form>

              {contactStatus.type !== "idle" && (
                <div
                  className={`mt-6 p-4 rounded-xl text-xs font-title uppercase tracking-wider text-center ${
                    contactStatus.type === "loading"
                      ? "bg-gray-100 text-gray-700"
                      : contactStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-red-500/10 text-red-700"
                  }`}
                >
                  {contactStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           SUPPORT & WARRANTY PORTAL (Tickets)
           ========================================== */}
      <section id="soporte" className="py-20 lg:py-32 bg-premium-mesh-dark border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-brand-blue font-title uppercase tracking-widest text-xs font-bold">PORTAL DE GARANTÍAS</span>
            <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-wide mt-2">
              Soporte Técnico y Reportes
            </h2>
            <div className="h-1 w-20 bg-brand-blue mx-auto mt-4" />
            <p className="text-gray-400 text-sm mt-3">
              ¿Eres cliente de Zirian y tienes un reporte? Levanta un ticket y un técnico te atenderá.
            </p>
          </div>

          <div className="bg-brand-charcoal border border-brand-border p-6 sm:p-10 rounded-2xl shadow-2xl">
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    value={ticketForm.nombre_cliente}
                    onChange={(e) => setTicketForm({ ...ticketForm, nombre_cliente: e.target.value })}
                    required
                    placeholder="Su nombre completo"
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Número de Folio o ID (Opcional)</label>
                  <input
                    type="text"
                    value={ticketForm.folio_cliente}
                    onChange={(e) => setTicketForm({ ...ticketForm, folio_cliente: e.target.value })}
                    placeholder="Ej: ZIR-1049 (Si cuenta con uno)"
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Descripción del problema o requerimiento *</label>
                <textarea
                  value={ticketForm.descripcion}
                  onChange={(e) => setTicketForm({ ...ticketForm, descripcion: e.target.value })}
                  rows={5}
                  required
                  placeholder="Describa el inconveniente a detalle..."
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">Adjuntar evidencia fotográfica (Opcional, máx. 5MB, JPG/PNG)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="w-full bg-brand-charcoal border border-brand-border text-gray-300 text-xs p-3 rounded-lg"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-dark py-4 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg cursor-pointer"
                >
                  Levantar Ticket de Soporte
                </button>
              </div>
            </form>

            {ticketStatus.type !== "idle" && (
              <div
                className={`mt-6 p-4 rounded-xl text-xs font-title uppercase tracking-wider text-center ${
                  ticketStatus.type === "loading"
                    ? "bg-brand-blue/20 text-brand-blue"
                    : ticketStatus.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {ticketStatus.message}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
           FOOTER
           ========================================== */}
      <footer className="bg-brand-dark border-t border-brand-border py-12 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Image
              src="/assets/images/logo.png"
              alt="Logo Zirian"
              width={120}
              height={33}
              className="h-8 w-auto object-contain mb-4"
            />
            <p className="text-gray-500 max-w-sm leading-relaxed">
              Zirian EV Charging Solutions & Systems es líder en infraestructura de carga y alta ingeniería eléctrica en el estado de Baja California Sur.
            </p>
            <p className="text-gray-600 mt-4">&copy; 2026 Zirian. Todos los derechos reservados.</p>
            <p className="text-gray-600 mt-1.5 text-[10px]">
              Sitio web hecho por{" "}
              <a
                href="https://www.expertosmkd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-blue transition-colors underline"
              >
                ExpertosMKD
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-title text-xs font-extrabold uppercase text-white tracking-widest mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li><a href="#cargadores" className="hover:text-brand-blue transition-colors">Cargadores EV</a></li>
              <li><a href="#servicios" className="hover:text-brand-blue transition-colors">Domótica Savant</a></li>
              <li><a href="#servicios" className="hover:text-brand-blue transition-colors">Redes y Conectividad</a></li>
              <li><a href="#servicios" className="hover:text-brand-blue transition-colors">CCTV y Alertas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-title text-xs font-extrabold uppercase text-white tracking-widest mb-4">Ubicaciones</h4>
            <ul className="space-y-2">
              <li>San José del Cabo, BCS</li>
              <li>Cabo San Lucas, BCS</li>
              <li>La Paz, BCS</li>
            </ul>
            <div className="mt-4">
              <span className="inline-block border border-brand-border px-3 py-1 text-[10px] text-gray-500 uppercase tracking-wider">
                Certificados NOM / CFE
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/526246220525"
          target="_blank"
          onClick={trackWhatsAppClick}
          className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 relative"
          aria-label="Contacto por WhatsApp"
        >
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.386 9.805-9.778.001-2.612-1.013-5.068-2.859-6.915C16.37 2.062 13.924.979 11.32.979 5.922.979 1.523 5.367 1.52 10.76c-.001 1.505.4 2.97 1.161 4.264l-.999 3.65 3.754-.984c1.238.675 2.58 1.026 3.911 1.028zm10.793-6.284c-.296-.147-1.748-.863-2.019-.961-.27-.099-.467-.147-.663.148-.196.295-.761.961-.933 1.158-.172.196-.344.22-.64.073-.296-.147-1.252-.461-2.385-1.471-.881-.786-1.476-1.756-1.649-2.05-.173-.296-.018-.456.13-.603.133-.132.296-.345.444-.517.149-.172.197-.295.296-.492.099-.197.05-.369-.024-.517-.075-.147-.663-1.598-.909-2.189-.239-.575-.483-.497-.663-.506-.172-.008-.368-.01-.565-.01-.196 0-.515.073-.784.369-.27.295-1.03 1.009-1.03 2.46 0 1.452 1.055 2.855 1.202 3.053.147.197 2.078 3.174 5.034 4.451.703.303 1.252.484 1.68.621.71.226 1.356.194 1.866.118.568-.084 1.748-.713 1.994-1.402.245-.689.245-1.279.172-1.402-.074-.123-.27-.197-.567-.345z" />
          </svg>
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping" />
        </a>
      </div>

    </div>
  );
}
