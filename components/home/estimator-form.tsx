'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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


export function EstimatorForm({ locale = 'es' }: { locale?: string }) {
  
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
      alert(locale === 'en' ? "Please select an option." : "Por favor, seleccione una opción.");
      return;
    }
    setCalcStep(step);
  };

  const handleCalcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcStatus({ type: "loading", message: locale === 'en' ? "PROCESSING ESTIMATION..." : "PROCESANDO ESTIMACIÓN..." });

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
          message: locale === 'en' ? `Successful Calculation! ${resData.message}` : `¡Cálculo Exitoso! ${resData.message}`,
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
          message: resData.error || (locale === 'en' ? "An error occurred. Try again." : "Ocurrió un error. Intente de nuevo."),
        });
      }
    } catch (err) {
      setCalcStatus({
        type: "error",
        message: locale === 'en' ? "Error sending request. Check your connection." : "Error al enviar la solicitud. Verifique su conexión.",
      });
    }
  };


  return (
    <>
            <section id="cotizador" className="py-20 lg:py-32 bg-premium-mesh-dark border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-brand-blue font-title uppercase tracking-widest text-xs font-bold">{locale === 'en' ? 'EV CHARGER ESTIMATOR' : 'ESTIMADOR DE CARGADORES EV'}</span>
            <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-wide mt-2">
              {locale === 'en' ? 'Qualify your Electric Charger Project' : 'Cualifica tu Proyecto de Cargador Eléctrico'}
            </h2>
            <p className="text-gray-400 text-sm mt-3">
              {locale === 'en' ? 'Complete the interactive wizard in just 30 seconds to estimate your electric car charger installation in Los Cabos or Riviera Maya.' : 'Completa el asistente interactivo en solo 30 segundos para estimar la instalación de tu cargador de auto eléctrico en Los Cabos o Riviera Maya.'}
            </p>
          </div>

          <div className="bg-brand-charcoal border border-brand-border p-6 sm:p-10 rounded-2xl shadow-2xl relative">
            
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-8 text-[10px] font-title uppercase tracking-widest font-extrabold text-gray-500">
              <span className={calcStep === 1 ? "text-brand-blue" : ""}>1. {locale === 'en' ? 'Vehicle' : 'Vehículo'}</span>
              <span className={calcStep === 2 ? "text-brand-blue" : ""}>2. {locale === 'en' ? 'Installation' : 'Instalación'}</span>
              <span className={calcStep === 3 ? "text-brand-blue" : ""}>3. {locale === 'en' ? 'Distance' : 'Distancia'}</span>
              <span className={calcStep === 4 ? "text-brand-blue" : ""}>4. {locale === 'en' ? 'Confirmation' : 'Confirmación'}</span>
            </div>

            <form onSubmit={handleCalcSubmit}>
              {/* Step 1 */}
              {calcStep === 1 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">{locale === 'en' ? 'What brand is your electric vehicle?' : '¿De qué marca es tu vehículo eléctrico?'}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["Tesla", "BYD", "Jetour", "Geely", "Volvo", "BMW", "Otro"].map((brand) => (
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
                          <span className="block text-xs uppercase tracking-widest font-title text-white">{brand === "Otro" ? (locale === 'en' ? "Other / Multi-brand" : "Otro / Multimarcas") : brand}</span>
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
                      {locale === 'en' ? 'Next' : 'Siguiente'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {calcStep === 2 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">{locale === 'en' ? 'What type of property is it?' : '¿Qué tipo de inmueble es?'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { val: "Residencial Casa", title: locale === 'en' ? "Residential Home / Villa" : "Casa Habitación / Villa", desc: locale === 'en' ? "Covered or open garage." : "Cochera techada o aire libre." },
                      { val: "Condominio", title: locale === 'en' ? "Condo / Building" : "Condominio / Edificio", desc: locale === 'en' ? "Requires piping to common areas." : "Requiere canalizaciones a áreas comunes." },
                      { val: "Comercial", title: locale === 'en' ? "Commercial / Office" : "Comercial / Oficina", desc: locale === 'en' ? "Parking for employees or clients." : "Estacionamiento para empleados o clientes." },
                      { val: "Flotilla", title: locale === 'en' ? "Fleet / Industrial" : "Flotilla / Industrial", desc: locale === 'en' ? "High-capacity infrastructure for companies." : "Infraestructura de alta capacidad para empresas." },
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
                      {locale === 'en' ? 'Back' : 'Atrás'}
                    </button>
                    <button
                      type="button"
                      onClick={() => goCalcNext(3)}
                      className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-3 font-title uppercase tracking-widest text-xs font-black rounded-lg"
                    >
                      {locale === 'en' ? 'Next' : 'Siguiente'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {calcStep === 3 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">{locale === 'en' ? 'Approximate distance to the load center' : 'Distancia aproximada al centro de carga'}</h3>
                  <div className="space-y-4">
                    {[
                      { val: "Corta (1-10 metros)", label: locale === 'en' ? "From 1 to 10 Meters" : "De 1 a 10 Metros", range: locale === 'en' ? "Short distance" : "Corta distancia" },
                      { val: "Media (11-30 metros)", label: locale === 'en' ? "From 11 to 30 Meters" : "De 11 a 30 Metros", range: locale === 'en' ? "Medium distance" : "Media distancia" },
                      { val: "Larga (Mas de 30 metros)", label: locale === 'en' ? "More than 30 Meters" : "Más de 30 Metros", range: locale === 'en' ? "Complex installation" : "Instalación compleja" },
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
                          <span className={`text-xs font-bold font-title ${item.range === "Media distancia" || item.range === "Medium distance" ? "text-white" : "text-brand-blue"}`}>
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
                      {locale === 'en' ? 'Back' : 'Atrás'}
                    </button>
                    <button
                      type="button"
                      onClick={() => goCalcNext(4)}
                      className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-3 font-title uppercase tracking-widest text-xs font-black rounded-lg"
                    >
                      {locale === 'en' ? 'Next' : 'Siguiente'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {calcStep === 4 && (
                <div>
                  <h3 className="font-title text-lg font-bold uppercase text-white tracking-wider mb-4">{locale === 'en' ? 'Where should we send your quote?' : '¿A dónde enviamos tu cotización?'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Full Name *' : 'Nombre Completo *'}</label>
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
                        <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Phone / WhatsApp *' : 'Teléfono / WhatsApp *'}</label>
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
                        <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Email Address' : 'Correo Electrónico'}</label>
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
                      <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Area / Villa / ZIP Code *' : 'Zona / Villa / Código Postal *'}</label>
                      <input
                        type="text"
                        name="ubicacion"
                        value={calcForm.ubicacion}
                        onChange={handleCalcInputChange}
                        required
                        placeholder={locale === 'en' ? "Ex: Palmilla, El Pedregal, Cabo San Lucas..." : "Ej: Palmilla, El Pedregal, Cabo San Lucas..."}
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
                      {locale === 'en' ? 'Back' : 'Atrás'}
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-3 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg"
                    >
                      {locale === 'en' ? 'Submit and Calculate' : 'Enviar y Calcular'}
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

      </>
  );
}
