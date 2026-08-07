import { ReactNode } from 'react';
import Link from 'next/link';
import { Camera, MapPin, Wrench } from 'lucide-react';

export default function TecnicoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-4 shadow-sm">
        <Link href="/tecnico" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-cyan text-primary-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">Zirian Field App</span>
        </Link>
        <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border">
          <span className="text-xs font-semibold text-muted-foreground">T1</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background pb-safe pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex h-14 items-center justify-around px-4">
          <Link href="/tecnico" className="flex flex-col items-center gap-1 text-brand-cyan">
            <MapPin className="h-5 w-5" />
            <span className="text-[10px] font-medium">Tareas</span>
          </Link>
          <button type="button" className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <Camera className="h-5 w-5" />
            <span className="text-[10px] font-medium">Inventario</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
