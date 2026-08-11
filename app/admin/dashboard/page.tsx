"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar as CalendarIcon,
  Phone,
  MessageCircle,
  LogOut,
  Mail,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Check,
  X,
  FileText,
  HelpCircle,
} from "lucide-react";
import { getDashboardMetrics } from "@/app/actions/dashboard";
import { AppShell } from "@/components/panel/app-shell";

interface Lead {
  id: number;
  nombre: string;
  telefono: string;
  email: string | null;
  marca_ev: string | null;
  tipo_instalacion: string | null;
  distancia_centro_carga: string | null;
  tipo_lead: string;
  ubicacion: string;
  status: string;
  fecha_visita: string | null;
  fecha_creacion: string;
}

interface SupportTicket {
  id: number;
  nombre_cliente: string;
  folio_cliente: string | null;
  descripcion: string;
  foto_path: string | null;
  status: string;
  fecha_creacion: string;
}

export default function AdminDashboardPage() {
  const [authorized, setAuthorized] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [metrics, setMetrics] = useState({ totalLeadsCount: 0, qualifiedQuotesCount: 0, openTicketsCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters and Selection States
  const [leadFilter, setLeadFilter] = useState<"all" | "Cotización Cualificada" | "Contacto Directo">("all");
  const [selectedEvent, setSelectedEvent] = useState<Lead | null>(null);

  // Date Picker Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleLeadId, setScheduleLeadId] = useState<number | null>(null);
  const [scheduleLeadName, setScheduleLeadName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  // Calendar Month/Year States
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const router = useRouter();

  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  // Authentication and Data Loading
  useEffect(() => {
    async function initDashboard() {
      try {
        const authRes = await fetch("/api/auth");
        if (!authRes.ok) {
          router.push("/admin");
          return;
        }

        const authData = await authRes.json();
        setUser(authData.user);
        setAuthorized(true);

        // Fetch CRM records
        const [leadsRes, ticketsRes, dashMetrics] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/tickets"),
          getDashboardMetrics()
        ]);

        if (leadsRes.ok && ticketsRes.ok) {
          const leadsData = await leadsRes.json();
          const ticketsData = await ticketsRes.json();
          setLeads(leadsData);
          setTickets(ticketsData);
          setMetrics(dashMetrics);
        }
      } catch (err) {
        console.error("Authentication or loading failed", err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router]);

  // Log out handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/admin");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Lead status modifier
  const updateLeadStatus = async (leadId: number, status: string, dateStr?: string) => {
    try {
      const response = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          status,
          fecha_visita: dateStr || null,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        // Update local state
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? resData.lead : l))
        );
      }
    } catch (err) {
      console.error("Failed to update lead status", err);
    }
  };

  // Support ticket status modifier
  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticketId,
          status,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? resData.ticket : t))
        );
      }
    } catch (err) {
      console.error("Failed to update ticket status", err);
    }
  };

  // Open Scheduler Assistant
  const openScheduleModalHandler = (leadId: number, leadName: string) => {
    setScheduleLeadId(leadId);
    setScheduleLeadName(leadName);

    // Set default schedule time: tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const localTomorrow = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60 * 1000);
    setScheduleDate(localTomorrow.toISOString().slice(0, 16));
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleLeadId && scheduleDate) {
      await updateLeadStatus(scheduleLeadId, "Visita Programada", scheduleDate);
      setShowScheduleModal(false);
      setScheduleLeadId(null);
      setScheduleLeadName("");
      setScheduleDate("");
    }
  };

  // Calendar utility calculations
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust to Mon-Sun layout
  const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // Helper date matching strings
  const formatDateString = (day: number) => {
    const yyyy = currentYear;
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const scheduledVisits = leads.filter((l) => l.status === "Visita Programada" && l.fecha_visita);

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setSelectedEvent(null);
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setSelectedEvent(null);
  };

  // Metrics calculators
  const { totalLeadsCount, qualifiedQuotesCount, openTicketsCount } = metrics;

  if (loading) {
    return (
      <div className="bg-brand-dark min-h-screen flex items-center justify-center text-slate-400 font-tech">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-brand-blue border-brand-border rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest">Iniciando Control Center...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <AppShell title="Dashboard" subtitle="Control Center - Operaciones y Vista General" user={user || undefined}>
      <div className="text-slate-100 font-sans">
        <main className="max-w-7xl mx-auto space-y-8">
        
        {/* BANNER WELCOME PROFILE (Rodrigo Gerente Access) */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/20 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-full bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-brand-blue/20">
                {user ? user.name.substring(0, 1).toUpperCase() : 'Z'}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="font-title text-2xl font-black uppercase text-white tracking-wide">
                    Hola {user ? user.name : 'Usuario'}
                  </h1>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs font-tech text-brand-blue font-semibold uppercase tracking-widest mt-1">
                  Tienes acceso de {user ? user.role : 'Invitado'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 font-tech uppercase tracking-wider">Fecha de Control</span>
              <span className="text-sm font-semibold font-tech text-white uppercase mt-0.5">
                {new Date().toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* METRICS CARDS PANEL */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Leads */}
          <div
            onClick={() => {
              setLeadFilter("all");
              document.getElementById("leads-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-slate-900/60 border border-slate-800/80 hover:border-brand-blue hover:scale-[1.02] transition duration-300 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group shadow-md"
          >
            <span className="text-xs text-slate-500 font-tech uppercase tracking-widest font-semibold">Total de Leads</span>
            <span className="text-4xl font-extrabold text-white font-tech mt-2 group-hover:text-brand-blue transition">
              {totalLeadsCount}
            </span>
            <span className="text-[10px] text-slate-400 mt-2 font-tech">Prospectos registrados</span>
          </div>

          {/* Card 2: Estimator Leads */}
          <div
            onClick={() => {
              setLeadFilter("Cotización Cualificada");
              document.getElementById("leads-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-slate-900/60 border border-slate-800/80 hover:border-brand-green hover:scale-[1.02] transition duration-300 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group shadow-md"
          >
            <span className="text-xs text-slate-500 font-tech uppercase tracking-widest font-semibold">Cotizaciones Cualificadas</span>
            <span className="text-4xl font-extrabold text-white font-tech mt-2 group-hover:text-brand-green transition">
              {qualifiedQuotesCount}
            </span>
            <span className="text-[10px] text-emerald-400 mt-2 font-tech font-bold">Cargadores EV</span>
          </div>

          {/* Card 3: Support Tickets */}
          <div
            onClick={() => {
              document.getElementById("tickets-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-slate-900/60 border border-slate-800/80 hover:border-red-500/50 hover:scale-[1.02] transition duration-300 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group shadow-md"
          >
            <span className="text-xs text-slate-500 font-tech uppercase tracking-widest font-semibold">Tickets Abiertos</span>
            <span className="text-4xl font-extrabold text-white font-tech mt-2 group-hover:text-red-400 transition">
              {openTicketsCount}
            </span>
            <span className="text-[10px] text-slate-400 mt-2 font-tech">Garantías y soporte</span>
          </div>
        </section>

        {/* CALENDAR SECTION: Eventos & Visitas Programadas */}
        <section id="calendar-section" className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm p-6 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="font-tech text-lg font-bold text-white flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-brand-blue" />
                Calendario de Visitas e Inspecciones Técnicas
              </h2>
              <p className="text-xs text-slate-400">Control visual de scouting técnico y citas programadas en Los Cabos</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <button onClick={prevMonth} className="text-slate-400 hover:text-white p-1 transition cursor-pointer">&lt;</button>
              <span className="text-sm font-semibold text-white font-tech min-w-[120px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button onClick={nextMonth} className="text-slate-400 hover:text-white p-1 transition cursor-pointer">&gt;</button>
            </div>
          </div>

          {/* Grid Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-7 gap-2 min-h-[300px]">
            {/* Blank tiles for previous month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => {
              const dayNum = prevMonthDays - firstDayIndex + 1 + idx;
              return (
                <div key={`prev-${idx}`} className="bg-slate-950/20 text-slate-700 p-2 rounded-lg border border-slate-900/35 min-h-[75px] text-left opacity-35 select-none text-xs">
                  {dayNum}
                </div>
              );
            })}

            {/* Current month active tiles */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = formatDateString(day);
              
              const today = new Date();
              const isToday =
                today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear;

              // Find matching visits
              const dayEvents = scheduledVisits.filter((v) => {
                if (!v.fecha_visita) return false;
                return v.fecha_visita.startsWith(dateStr);
              });

              return (
                <div
                  key={`day-${day}`}
                  className={`p-2 rounded-lg border min-h-[75px] text-left transition relative ${
                    isToday
                      ? "bg-blue-950/30 border-brand-blue/50"
                      : "bg-slate-950/40 border-slate-800/80"
                  }`}
                >
                  <span className={`text-xs font-semibold ${isToday ? "text-brand-blue" : "text-slate-400"}`}>
                    {day}
                  </span>

                  {dayEvents.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {dayEvents.map((evt) => {
                        const timeStr = evt.fecha_visita
                          ? new Date(evt.fecha_visita).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "";
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className="text-[10px] bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.5 rounded-md cursor-pointer truncate font-medium hover:bg-emerald-900 transition font-tech"
                            title={`Visita programada con ${evt.nombre}`}
                          >
                            {timeStr} - {evt.nombre}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Event Detail Drawer / Card */}
          {selectedEvent && (
            <div className="mt-6 bg-slate-950/90 border border-brand-blue/30 p-5 rounded-2xl shadow-inner relative animate-fadeIn">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
                <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Detalle del Evento
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  &times; Cerrar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" /> Cliente
                  </p>
                  <p className="text-white font-bold text-lg mt-0.5">{selectedEvent.nombre}</p>
                  
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mt-4 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> Ubicación
                  </p>
                  <p className="text-slate-300 mt-0.5">{selectedEvent.ubicacion}</p>
                </div>
                
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Fecha y Hora de Visita
                  </p>
                  <p className="text-brand-blue font-tech font-bold text-lg mt-0.5">
                    {selectedEvent.fecha_visita
                      ? new Date(selectedEvent.fecha_visita).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "No agendada"}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href={`tel:${selectedEvent.telefono}`}
                      className="inline-flex items-center bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      Llamar
                    </a>
                    <a
                      href={`https://wa.me/${selectedEvent.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* TABLE 1: Leads Section */}
        <section id="leads-section" className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-md">
          <div className="p-6 border-b border-slate-850 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-tech text-lg font-bold text-white flex items-center">
                <Filter className="w-4 h-4 mr-2 text-brand-blue" />
                Prospectos y Cotizaciones Recibidas
              </h2>
              <p className="text-xs text-slate-400">Administre el embudo de ventas y agende visitas técnicas de scouting</p>
            </div>

            {/* Filter badge indicators */}
            <div className="flex items-center space-x-2">
              {leadFilter !== "all" && (
                <span className="bg-brand-blue/15 border border-brand-blue/30 text-brand-blue text-[10px] font-bold px-2.5 py-1 rounded-full font-tech">
                  Filtro: {leadFilter === "Cotización Cualificada" ? "Cotizaciones" : "Contacto"}
                </span>
              )}
              {leadFilter !== "all" && (
                <button
                  onClick={() => setLeadFilter("all")}
                  className="bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-xs transition cursor-pointer"
                >
                  Restablecer
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Detalles (Estimador)</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {leads.filter((l) => leadFilter === "all" || l.tipo_lead === leadFilter).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-tech">
                      No hay leads que coincidan con la selección activa.
                    </td>
                  </tr>
                ) : (
                  leads
                    .filter((l) => leadFilter === "all" || l.tipo_lead === leadFilter)
                    .map((l) => (
                      <tr key={l.id} className="hover:bg-slate-950/20 transition duration-150">
                        <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(l.fecha_creacion).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{l.nombre}</div>
                          <div className="text-xs text-slate-400 flex flex-col mt-0.5 space-y-0.5">
                            <span className="flex items-center"><Phone className="w-3 h-3 mr-1 inline" /> {l.telefono}</span>
                            {l.email && <span className="flex items-center"><Mail className="w-3 h-3 mr-1 inline" /> {l.email}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {l.tipo_lead === "Cotización Cualificada" ? (
                            <span className="px-2.5 py-1 text-[10px] rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-medium font-tech uppercase">
                              Cualificada
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 font-medium font-tech uppercase">
                              Contacto
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {l.tipo_lead === "Cotización Cualificada" ? (
                            <div className="text-xs text-slate-300 space-y-0.5">
                              <div>🚗 Auto: <span className="font-semibold text-white">{l.marca_ev}</span></div>
                              <div>🏢 Lugar: {l.tipo_instalacion}</div>
                              <div>📏 Distancia: {l.distancia_centro_carga}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{l.ubicacion}</td>
                        
                        <td className="px-6 py-4 text-center">
                          {(() => {
                            let badgeClass = "bg-slate-800 text-slate-300";
                            if (l.status === "Nuevo") {
                              badgeClass = "bg-blue-900/50 text-blue-300 border border-blue-500/30";
                            } else if (l.status === "Contactado") {
                              badgeClass = "bg-amber-900/50 text-amber-300 border border-amber-500/30";
                            } else if (l.status === "Visita Programada") {
                              badgeClass = "bg-emerald-900/50 text-emerald-300 border border-emerald-500/30";
                            }
                            return (
                              <div className="flex flex-col items-center">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${badgeClass}`}>
                                  {l.status}
                                </span>
                                {l.status === "Visita Programada" && l.fecha_visita && (
                                  <span className="mt-1 text-[10px] text-emerald-400 font-tech font-bold">
                                    📅 {new Date(l.fecha_visita).toLocaleString("es-MX", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="inline-flex rounded-md shadow-sm" role="group">
                            <button
                              onClick={() => updateLeadStatus(l.id, "Contactado")}
                              className="px-2.5 py-1.5 text-xs font-medium rounded-l-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
                              title="Marcar como Contactado"
                            >
                              Contactar
                            </button>
                            <button
                              onClick={() => openScheduleModalHandler(l.id, l.nombre)}
                              className="px-2.5 py-1.5 text-xs font-medium rounded-r-lg border-t border-b border-r border-slate-700 bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                              title="Programar Visita de Scouting"
                            >
                              Agendar Visita
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TABLE 2: Active Support Tickets */}
        <section id="tickets-section" className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-md">
          <div className="p-6 border-b border-slate-850 bg-slate-900/40">
            <h2 className="font-tech text-lg font-bold text-white flex items-center">
              <HelpCircle className="w-4.5 h-4.5 mr-2 text-brand-blue" />
              Tickets de Soporte Técnico
            </h2>
            <p className="text-xs text-slate-400">Solicitudes de soporte y garantías recibidas por Zirian</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Folio / ID</th>
                  <th className="px-6 py-4">Descripción del Problema</th>
                  <th className="px-6 py-4 text-center">Adjunto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500 font-tech">
                      No hay tickets de soporte registrados aún.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-950/20 transition duration-150">
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(t.fecha_creacion).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                        {t.nombre_cliente}
                      </td>
                      <td className="px-6 py-4 font-tech font-bold text-white whitespace-nowrap">
                        {t.folio_cliente ? `#${t.folio_cliente}` : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-xs break-words whitespace-normal">
                        {t.descripcion}
                      </td>
                      
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {t.foto_path ? (
                          <a
                            href={t.foto_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-brand-blue hover:underline font-semibold"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Ver Foto
                          </a>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${
                            t.status === "Abierto"
                              ? "bg-red-950/60 border border-red-500/30 text-red-400"
                              : t.status === "Resuelto"
                              ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                          <button
                            onClick={() => updateTicketStatus(t.id, "Resuelto")}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-l-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                            title="Marcar como Resuelto"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() => updateTicketStatus(t.id, "Cerrado")}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-r-lg border-t border-b border-r border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition cursor-pointer"
                            title="Cerrar Ticket"
                          >
                            Cerrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* DATE SCHEDULER POPUP MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="font-tech text-lg font-bold text-white mb-2">Programar Inspección Técnica</h3>
            <p className="text-xs text-slate-400 mb-6">Asigne fecha y hora para la visita de scouting del cliente.</p>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 font-tech">
                  Cliente
                </label>
                <input
                  type="text"
                  value={scheduleLeadName}
                  readOnly
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label htmlFor="schedule-date" className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 font-tech">
                  Fecha y Hora de Visita *
                </label>
                <input
                  type="datetime-local"
                  id="schedule-date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-emerald-600 hover:from-brand-blue hover:to-emerald-500 text-white font-semibold text-sm shadow-md transition cursor-pointer"
                >
                  Agendar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="w-full max-w-7xl mx-auto mt-12 text-center text-xs text-slate-600 font-tech uppercase tracking-wider">
        ZIRIAN CONTROL CENTER &copy; {new Date().getFullYear()} • DESARROLLO DE ALTA INGENIERÍA EN ENERGÍA EV.
      </footer>

      </div>
    </AppShell>
  );
}
