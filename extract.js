const fs = require('fs');

const lines = fs.readFileSync('c:/CODES/Zirian-Website/app/[locale]/page-es.tsx', 'utf8').split('\n');

const createComponent = (name, start, end, imports, stateHooks, returnWrapper) => {
  const jsx = lines.slice(start, end).join('\n');
  const content = `'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
${imports}

export function ${name}() {
  ${stateHooks}

  return (
    <>
      ${jsx}
    </>
  );
}
`;
  fs.writeFileSync(`c:/CODES/Zirian-Website/components/home/${name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.tsx`, content);
  console.log(`Created ${name}`);
};

// 1. HomeHeader
createComponent('HomeHeader', 309, 401, `import { LanguageSwitcher } from "@/components/ui/language-switcher";`, `
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
`);

// 2. Hero
createComponent('Hero', 405, 502, `
const bgImages = [
  "/assets/images/hero_ev_charger.jpg",
  "/assets/images/smart_home_savant.jpg",
  "/assets/images/security_network_vps.jpg",
  "/assets/images/solar_panels_batteries.jpg",
];
`, `
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
`);

// 3. StatsBar
createComponent('StatsBar', 503, 524, '', '');

// 4. BrandsMarquee
createComponent('BrandsMarquee', 525, 561, '', '');

// 5. EvChargers
createComponent('EvChargers', 562, 649, '', '');

// 6. SmartHome
createComponent('SmartHome', 650, 729, '', '');

// 7. SecurityAlddea
createComponent('SecurityAlddea', 730, 846, '', '');

// 8. EstimatorForm
createComponent('EstimatorForm', 847, 1090, `
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
`, `
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

  const handleCalcRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalcForm({ ...calcForm, [e.target.name]: e.target.value });
  };

  const handleCalcInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalcForm({ ...calcForm, [e.target.name]: e.target.value });
  };

  const currentStepValueEmpty = () => {
    if (calcStep === 1) return !calcForm.marca_ev;
    if (calcStep === 2) return !calcForm.tipo_instalacion;
    if (calcStep === 3) return !calcForm.distancia_centro_carga;
    return false;
  };

  const goCalcNext = (step: number) => {
    if (currentStepValueEmpty()) {
      alert("Por favor, seleccione una opción.");
      return;
    }
    setCalcStep(step);
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
          message: \`¡Cálculo Exitoso! \${resData.message}\`,
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
`);

// 9. ContactForm
createComponent('ContactForm', 1091, 1265, `
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
`, `
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
          message: \`¡Listo! \${resData.message}\`,
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
`);

// 10. SupportTicket
createComponent('SupportTicket', 1266, 1387, `
const trackTicketSubmit = () => {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "ticket_submitted",
      submission_time: new Date().toISOString(),
    });
  }
};
`, `
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
          message: \`¡Ticket Abierto! \${resData.message}\`,
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
`);

// 11. HomeFooter
createComponent('HomeFooter', 1388, 1416, '', `
  const trackWhatsAppClick = () => {
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "whatsapp_click",
        click_time: new Date().toISOString(),
      });
    }
  };
`);

console.log('All components extracted.');
