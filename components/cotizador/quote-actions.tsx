'use client'

import { deleteQuote } from "@/app/actions/quotes"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Link as LinkIcon, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function QuoteActions({ quoteId, token }: { quoteId: number, token?: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cotización de forma permanente? Se borrarán todas las partidas asociadas.')) {
      setIsDeleting(true)
      try {
        await deleteQuote(quoteId)
        window.location.reload()
      } catch (e) {
        console.error(e)
        alert('Hubo un error al eliminar la cotización.')
        setIsDeleting(false)
      }
    }
  }

  const handleCopyLink = () => {
    if (!token) return;
    const url = `${window.location.origin}/presupuesto/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2 w-full mt-2">
      <Link href={`/admin/cotizador?editId=${quoteId}`} className="flex-1">
        <Button variant="outline" size="sm" className="w-full h-8 text-[10px] font-tech font-bold uppercase tracking-wider border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-brand-blue/20 hover:border-brand-blue/30 transition-colors">
          <Edit className="w-3 h-3 mr-2" />
          Editar Cotización
        </Button>
      </Link>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-8 h-8 p-0 text-slate-400 border-slate-700 bg-slate-900 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900/50 transition-colors shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      {token && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopyLink}
          className="w-8 h-8 p-0 text-slate-400 border-slate-700 bg-slate-900 hover:text-brand-blue hover:bg-brand-blue/20 hover:border-brand-blue/30 transition-colors shrink-0"
          title="Copiar Link Web"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
        </Button>
      )}
    </div>
  )
}
