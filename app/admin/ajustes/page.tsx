import { getStripeEnvironment, setStripeEnvironment } from './actions';
import { auth } from '@/auth';
import { Switch } from '@/components/ui/switch';
import { redirect } from 'next/navigation';
import { Settings, CreditCard, ShieldAlert, ShieldCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AjustesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }

  const currentEnv = await getStripeEnvironment();
  const isTest = currentEnv === 'test';

  async function toggleEnvironment(formData: FormData) {
    'use server';
    const newEnv = currentEnv === 'test' ? 'live' : 'test';
    await setStripeEnvironment(newEnv, session!.user!.email!);
    revalidatePath('/admin/ajustes');
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/30 shadow-[0_0_20px_rgba(0,163,255,0.2)]">
          <Settings className="w-6 h-6 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-title text-slate-100 uppercase tracking-wider">Ajustes del Sistema</h1>
          <p className="text-sm text-slate-400 font-tech">Configuraciones globales de Zirian CRM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Stripe Environment Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 flex-shrink-0 mt-1">
                <CreditCard className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">Entorno de Pagos Stripe</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-lg">
                  Cambia entre el modo de Pruebas (Test) con tarjetas falsas y el modo Producción (Live) con cobros reales a clientes.
                </p>
              </div>
            </div>
            
            <form action={toggleEnvironment} className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className={`text-xs font-bold uppercase tracking-wider ${!isTest ? 'text-[#00FF41]' : 'text-slate-500'}`}>
                  Live
                </span>
                
                <button type="submit" className="relative group rounded-full">
                  <div className={`w-14 h-7 rounded-full transition-colors flex items-center px-1 ${isTest ? 'bg-amber-500' : 'bg-[#00FF41]'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isTest ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </div>
                </button>

                <span className={`text-xs font-bold uppercase tracking-wider ${isTest ? 'text-amber-500' : 'text-slate-500'}`}>
                  Test
                </span>
              </div>
            </form>
          </div>

          <div className="p-6 bg-slate-950/50">
            {isTest ? (
              <div className="flex items-start gap-3 text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/30">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider mb-1">Modo de Pruebas Activo</p>
                  <p className="text-xs opacity-90">Las compras en la tienda no generarán cargos reales. Se utilizarán las llaves "pk_test" y "sk_test" de Stripe. Ideal para desarrolladores y pruebas internas.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-[#00FF41] bg-[#00FF41]/10 p-4 rounded-xl border border-[#00FF41]/30">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider mb-1">Modo Producción Activo</p>
                  <p className="text-xs opacity-90">Las compras en la tienda generarán cargos REALES a las tarjetas de crédito de los clientes. Se utilizarán las llaves "pk_live" y "sk_live" de Stripe.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
