import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function CheckoutSuccessPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ session_id?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const isEn = resolvedParams.locale === 'en';

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col">
      <HomeHeader locale={resolvedParams.locale} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-32 pb-12">
        <div className="bg-slate-900/80 border border-[#00FF41]/30 p-12 rounded-3xl max-w-2xl w-full shadow-[0_0_50px_rgba(0,255,65,0.1)]">
          <div className="mx-auto w-20 h-20 bg-[#00FF41]/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-[#00FF41]" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold font-title uppercase tracking-wider text-white mb-4">
            {isEn ? 'Payment Successful!' : '¡Pago Exitoso!'}
          </h1>
          
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            {isEn 
              ? 'Thank you for your purchase. We have received your order and are processing it right away.' 
              : 'Gracias por tu compra. Hemos recibido tu orden y la estamos procesando inmediatamente.'}
          </p>

          <div className="bg-brand-dark rounded-2xl p-6 mb-8 border border-slate-800 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-brand-cyan" />
              <h3 className="font-bold text-white">
                {isEn ? 'Order Information' : 'Información de tu Orden'}
              </h3>
            </div>
            <p className="text-sm text-slate-400">
              {isEn ? 'Session ID:' : 'ID de Transacción:'} <br/>
              <span className="font-mono text-xs break-all text-slate-500 mt-1 block">
                {resolvedSearch.session_id || 'N/A'}
              </span>
            </p>
            <p className="text-sm text-slate-400 mt-4">
              {isEn 
                ? 'We will send a receipt and tracking details to your email shortly.' 
                : 'En breve enviaremos tu recibo y los detalles de seguimiento a tu correo electrónico.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={`/${resolvedParams.locale}/store`}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-colors"
            >
              {isEn ? 'Continue Shopping' : 'Seguir Comprando'}
            </Link>
            <Link 
              href={`/${resolvedParams.locale}/portal`}
              className="w-full sm:w-auto bg-brand-cyan hover:bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group"
            >
              {isEn ? 'Go to My Portal' : 'Ir a Mi Portal'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      <HomeFooter locale={resolvedParams.locale} />
    </div>
  );
}
