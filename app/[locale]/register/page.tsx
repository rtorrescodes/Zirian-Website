import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';
import { RegisterForm } from './register-form';
import { UserPlus } from 'lucide-react';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-blue/30 selection:text-white flex flex-col">
      <HomeHeader locale={resolvedParams.locale} />
      
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-premium-mesh-dark opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-cyan/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/20 text-brand-green mb-4">
                <UserPlus className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold font-title uppercase tracking-wider text-white">
                {resolvedParams.locale === 'en' ? 'Create Account' : 'Crear Cuenta'}
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                {resolvedParams.locale === 'en' 
                  ? 'Join Zirian to manage your smart home and engineering projects.' 
                  : 'Únete a Zirian para gestionar tu domótica y proyectos de ingeniería.'}
              </p>
            </div>

            <RegisterForm locale={resolvedParams.locale} />
          </div>
        </div>
      </main>

      <HomeFooter locale={resolvedParams.locale} />
    </div>
  );
}
