import { cn } from '@/lib/utils'

export function ZirianLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span aria-hidden className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" role="img" aria-label="Zirian">
          <path
            d="M16 2 L29 24 H3 Z"
            stroke="var(--brand-green)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 10 L23 24 H9 Z"
            fill="var(--brand-cyan)"
            fillOpacity="0.9"
          />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        ZIRI<span className="text-brand-cyan">A</span>N
      </span>
    </div>
  )
}
