'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface ClockConfig {
  code: string
  label: string
  timeZone: string
}

const ZONES: ClockConfig[] = [
  { code: 'CAB', label: 'Los Cabos', timeZone: 'America/Mazatlan' },
  { code: 'GDL', label: 'Guadalajara', timeZone: 'America/Mexico_City' },
  { code: 'CUN', label: 'Cancún', timeZone: 'America/Cancun' },
]

export function WorldClocks() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState<Date>(new Date())

  useEffect(() => {
    setMounted(true)
    setTime(new Date())

    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (timeZone: string) => {
    if (!mounted) return '--:--'
    return time.toLocaleTimeString('es-MX', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div
      className="hidden md:flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm select-none"
      title="Horas locales operativas: Los Cabos (UTC-7), Guadalajara (UTC-6), Cancún (UTC-5)"
    >
      <Clock className="h-3.5 w-3.5 text-brand-blue/70 shrink-0 mr-0.5" />
      {ZONES.map((zone, idx) => (
        <div key={zone.code} className="flex items-center">
          {idx > 0 && <span className="text-slate-700 mx-1 text-[10px]">•</span>}
          <div className="flex items-baseline gap-1 text-[11px] font-tech font-medium leading-none">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">
              {zone.code}
            </span>
            <span className="text-slate-100 font-mono tracking-tight text-[11px]">
              {formatTime(zone.timeZone)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
