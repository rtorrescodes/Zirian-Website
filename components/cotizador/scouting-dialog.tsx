'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Zap, Calculator } from 'lucide-react'

interface ScoutingDialogProps {
  onCalculate: (params: { 
    distancia: number, 
    breaker: boolean, 
    ranurado: boolean, 
    altura: boolean 
  }) => void;
}

export function ScoutingDialog({ onCalculate }: ScoutingDialogProps) {
  const [open, setOpen] = useState(false)
  const [distancia, setDistancia] = useState<number>(10)
  const [breaker, setBreaker] = useState(false)
  const [ranurado, setRanurado] = useState(false)
  const [altura, setAltura] = useState(false)

  const handleCalculate = () => {
    onCalculate({
      distancia: Number(distancia),
      breaker,
      ranurado,
      altura
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button 
          variant="outline" 
          className="w-full mt-2 border-brand-cyan/50 text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan/20 font-tech font-bold uppercase tracking-widest transition-all"
        />
      }>
        <Zap className="w-4 h-4 mr-2" />
        Scouting Rápido
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="font-tech text-lg text-brand-cyan uppercase tracking-widest flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo por Scouting
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="distancia" className="text-slate-400 font-tech text-xs uppercase tracking-wider">
              Distancia del cableado (metros)
            </Label>
            <Input
              id="distancia"
              type="number"
              value={distancia}
              onChange={(e) => setDistancia(Number(e.target.value))}
              className="bg-slate-900 border-slate-700 text-white font-mono text-lg h-12"
            />
          </div>
          
          <div className="flex flex-col gap-4 border-t border-slate-800 pt-4">
            <Label className="text-slate-400 font-tech text-xs uppercase tracking-wider mb-1">
              Variables Adicionales
            </Label>
            
            <div className="flex items-center space-x-3">
              <Checkbox id="breaker" checked={breaker} onCheckedChange={(c) => setBreaker(c === true)} className="border-slate-600 data-[state=checked]:bg-brand-cyan data-[state=checked]:text-black" />
              <Label htmlFor="breaker" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300">
                Requiere Breaker 40A Square D (Inicio)
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox id="ranurado" checked={ranurado} onCheckedChange={(c) => setRanurado(c === true)} className="border-slate-600 data-[state=checked]:bg-brand-cyan data-[state=checked]:text-black" />
              <Label htmlFor="ranurado" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300">
                Lleva ranurado y resane (Yeso)
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox id="altura" checked={altura} onCheckedChange={(c) => setAltura(c === true)} className="border-slate-600 data-[state=checked]:bg-brand-cyan data-[state=checked]:text-black" />
              <Label htmlFor="altura" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300">
                Trabajo en Altura (Requiere equipo extra)
              </Label>
            </div>
          </div>
        </div>
        <Button onClick={handleCalculate} className="w-full bg-brand-cyan text-black hover:bg-brand-cyan/80 font-tech font-bold uppercase tracking-widest h-12 mt-2">
          Generar Partidas
        </Button>
      </DialogContent>
    </Dialog>
  )
}
