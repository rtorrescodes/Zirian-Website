'use client'

import { useTransition } from 'react'
import { MinusCircle, Loader2 } from 'lucide-react'
import { addToSyscomBlacklist } from '@/app/actions/syscom-blacklist'

export function BlacklistButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleBlacklist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('¿Ocultar este producto de la tienda pública?')) {
      startTransition(async () => {
        await addToSyscomBlacklist(productId)
      })
    }
  }

  return (
    <button
      onClick={handleBlacklist}
      disabled={isPending}
      className="absolute top-2 left-2 bg-red-600/90 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg z-20 backdrop-blur-sm transition-transform hover:scale-110 disabled:opacity-50"
      title="Ocultar de la tienda (Blacklist)"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MinusCircle className="w-4 h-4" />
      )}
    </button>
  )
}
