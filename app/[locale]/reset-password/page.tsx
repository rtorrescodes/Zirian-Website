import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';
import { ResetPasswordForm } from './reset-password-form';
import { KeyRound } from 'lucide-react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function ResetPasswordPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ token?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  if (!resolvedSearch.token) {
    redirect(`/${resolvedParams.locale}/login`);
  }

  // Verify token is valid and not expired
  const user = await prisma.webUser.findUnique({
    where: { resetToken: resolvedSearch.token }
  });

  const isExpired = !user?.resetTokenExpiry || user.resetTokenExpiry < new Date();
  
  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-blue/30 selection:text-white flex flex-col">
      <HomeHeader locale={resolvedParams.locale} />
      
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-premium-mesh-dark opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-cyan/20 text-brand-cyan mb-4">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold font-title uppercase tracking-wider text-white">
                {resolvedParams.locale === 'en' ? 'New Password' : 'Nueva Contraseña'}
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                {resolvedParams.locale === 'en' 
                  ? 'Enter your new password below.' 
                  : 'Ingresa tu nueva contraseña a continuación.'}
              </p>
            </div>

            {(!user || isExpired) ? (
              <div className="text-center">
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-lg mb-6">
                  {resolvedParams.locale === 'en' 
                    ? 'This password reset link is invalid or has expired.' 
                    : 'Este enlace es inválido o ha expirado.'}
                </div>
                <a href={`/${resolvedParams.locale}/forgot-password`} className="text-brand-cyan hover:text-white font-bold transition-colors">
                  {resolvedParams.locale === 'en' ? 'Request a new link' : 'Solicitar nuevo enlace'}
                </a>
              </div>
            ) : (
              <ResetPasswordForm locale={resolvedParams.locale} token={resolvedSearch.token} />
            )}
          </div>
        </div>
      </main>

      <HomeFooter locale={resolvedParams.locale} />
    </div>
  );
}
