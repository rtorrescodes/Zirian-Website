"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, AlertTriangle, Briefcase, Server, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  categoria: string;
  url: string | null;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (cat: string) => {
    switch (cat) {
      case "CRM": return <Briefcase className="w-4 h-4 text-brand-blue" />;
      case "Inventario": return <Clock className="w-4 h-4 text-amber-500" />;
      case "Errores": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("relative transition-colors", open ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white")}
        aria-label="Notificaciones"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifs();
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-green ring-2 ring-brand-dark animate-pulse" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden font-tech">
          <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">Notificaciones ({unreadCount})</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-brand-blue hover:text-white transition-colors"
              >
                Marcar leídas
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-xs">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center">
                <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-3 border-b border-slate-800/50 transition-colors flex gap-3 group relative",
                    n.isRead ? "opacity-60 bg-transparent" : "bg-slate-800/20 hover:bg-slate-800/40"
                  )}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(n.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white mb-0.5">{n.title}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{new Date(n.createdAt).toLocaleString('es-MX')}</p>
                  </div>
                  
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-all rounded"
                      title="Marcar como leída"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {n.url && (
                    <Link href={n.url} onClick={() => setOpen(false)} className="absolute bottom-2 right-2 p-1 text-brand-blue hover:text-white transition-all opacity-0 group-hover:opacity-100" title="Ver detalle">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
      )}
    </div>
  );
}
