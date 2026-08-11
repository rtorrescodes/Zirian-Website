'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardCheck,
  Wrench,
  LifeBuoy,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  Map,
  LogOut,
  Camera,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ZirianLogo } from './zirian-logo'
import AIChatWidget from '@/components/ai/AIChatWidget'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  soon?: boolean
}

const nav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Cotizador', href: '/admin/cotizador', icon: Plus },
  { label: 'Cotizaciones', href: '/admin/cotizaciones', icon: FileText },
  { label: 'Productos / Catálogo', href: '/admin/productos', icon: Settings },
  { label: 'Clientes / CRM', href: '/admin/clientes', icon: Users },
  { label: 'Calendario', href: '/admin/calendario', icon: Calendar },
  { label: 'Levantamientos', href: '/admin/levantamientos', icon: Map },
  { label: 'Diseño CCTV', href: '/admin/design-cctv', icon: Camera },
  { label: 'Mantenimientos', href: '/admin/mantenimientos', icon: Wrench },
  { label: 'Tickets', href: '/admin/tickets', icon: LifeBuoy },
  { label: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { label: 'Blog / Guías', href: '/admin/blog', icon: FileText },
  { label: 'Partners', href: '/admin/partners', icon: Users },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {nav.map((item) => {
        const active = item.href === pathname
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-tech uppercase tracking-widest transition-all',
              active
                ? 'bg-brand-blue/10 border border-brand-blue/30 text-brand-blue shadow-[0_0_15px_rgba(0,163,255,0.15)]'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-blue shadow-[0_0_10px_rgba(0,163,255,0.8)]" />
            )}
            <Icon
              className={cn(
                'h-[18px] w-[18px] shrink-0 transition-colors',
                active ? 'text-brand-blue drop-shadow-[0_0_5px_rgba(0,163,255,0.5)]' : 'text-slate-500 group-hover:text-brand-cyan',
              )}
            />
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan/15 px-1.5 text-[11px] font-semibold text-brand-cyan">
                {item.badge}
              </span>
            )}
            {item.soon && !item.badge && (
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                pronto
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({ onNavigate, user }: { onNavigate?: () => void, user?: { name: string; role: string } }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <ZirianLogo />
      </div>
      <div className="mt-2 flex-1 overflow-y-auto pb-4">
        <p className="px-6 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Operaciones
        </p>
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-slate-800 p-3">
        {(!user || user.role === 'SuperAdmin' || user.role === 'Gerente') && (
          <>
            <Link
              href="/admin/configuracion/usuarios"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-tech uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
            >
              <Users className="h-[18px] w-[18px] text-slate-500" />
              Usuarios y Accesos
            </Link>
            <Link
              href="/admin/ajustes"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-tech uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
            >
              <Settings className="h-[18px] w-[18px] text-slate-500" />
              Ajustes Globales
            </Link>
          </>
        )}
        <Link href="/admin/perfil" className="mt-2 flex items-center gap-3 rounded-lg bg-slate-900/50 border border-slate-800 px-3 py-2.5 transition hover:bg-slate-800 group">
          <Avatar className="h-9 w-9 border border-brand-blue/30 shadow-[0_0_10px_rgba(0,163,255,0.1)]">
            <AvatarFallback className="bg-brand-blue/10 text-xs font-bold text-brand-blue group-hover:bg-brand-blue group-hover:text-slate-950 hover:bg-brand-cyan transition">
              {user ? user.name.substring(0, 2).toUpperCase() : 'MV'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white font-tech uppercase">{user ? user.name : 'Marcos Vidal'}</p>
            <p className="truncate text-[10px] text-slate-500 font-tech uppercase tracking-widest transition group-hover:text-brand-blue">Mi Perfil</p>
          </div>
        </Link>
        
        <button 
          onClick={() => {
            if (confirm('¿Deseas cerrar sesión?')) {
              fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }).then(() => window.location.href = '/admin');
            }
          }}
          className="mt-2 w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-tech uppercase tracking-widest font-bold text-red-500/80 transition-colors hover:bg-red-950/40 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export function AppShell({
  title,
  subtitle,
  children,
  user,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  user?: { name: string; role: string }
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-brand-dark text-slate-100 font-sans bg-premium-mesh-dark">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl lg:block shadow-2xl">
        <div className="sticky top-0 h-screen">
          <SidebarContent user={user} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-slate-800 bg-slate-950 shadow-xl overflow-y-auto">
            <button
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} user={user} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-brand-dark/80 backdrop-blur-md shadow-sm">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-slate-800"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="font-tech truncate text-lg font-bold uppercase tracking-widest text-white sm:text-xl flex items-center gap-2">
                <span className="h-4 w-1 bg-brand-blue rounded-full"></span>
                {title}
              </h1>
              {subtitle && (
                <p className="hidden truncate text-xs font-tech text-slate-400 sm:block tracking-wide pl-6">{subtitle}</p>
              )}
            </div>

            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Buscar clientes, cotizaciones…"
                className="h-9 w-64 bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-500 pl-9 focus-visible:ring-brand-blue"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-green" />
            </Button>

            <Link
              href="/cotizador"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'hidden bg-primary font-semibold text-primary-foreground hover:bg-primary/90 sm:inline-flex',
              )}
            >
              <Plus className="h-4 w-4" />
              Nueva cotización
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <AIChatWidget />
    </div>
  )
}

export { Badge }
