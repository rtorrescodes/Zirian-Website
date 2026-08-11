import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { HomeHeader } from '@/components/home/home-header';
import { HomeFooter } from '@/components/home/home-footer';

export default async function PortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  
  if (!session || !session.user) {
    redirect(`/${resolvedParams.locale}/login`);
  }

  // Fetch the WebUser with their linked CRM Client
  const webUser = await prisma.webUser.findUnique({
    where: { email: session.user.email as string },
    include: {
      client: {
        include: {
          quotes: true,
          cctvProjects: true,
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-blue/30 selection:text-white flex flex-col">
      <HomeHeader locale={resolvedParams.locale} />
      
      <main className="flex-1 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold font-title uppercase tracking-wider mb-2">
          {resolvedParams.locale === 'en' ? 'Welcome,' : 'Bienvenido,'} {webUser?.name || session.user.name}
        </h1>
        
        {webUser?.clientId ? (
          <div className="bg-brand-green/10 text-brand-green border border-brand-green/30 px-4 py-2 rounded-lg inline-block text-sm font-bold tracking-wide uppercase mb-8 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            CRM ID: #{webUser.clientId}
          </div>
        ) : (
          <p className="text-slate-400 mb-8 text-sm">Cargando perfil CRM...</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {resolvedParams.locale === 'en' ? 'My Quotes' : 'Mis Cotizaciones'}
            </h2>
            {webUser?.client?.quotes && webUser.client.quotes.length > 0 ? (
              <ul className="space-y-3">
                {webUser.client.quotes.map(quote => (
                  <li key={quote.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span>Cotización #{quote.id}</span>
                    <span className="text-xs bg-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-md uppercase font-bold tracking-wider">{quote.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">
                {resolvedParams.locale === 'en' ? 'No quotes available yet.' : 'No tienes cotizaciones activas.'}
              </p>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {resolvedParams.locale === 'en' ? 'Store Orders' : 'Pedidos de Tienda'}
            </h2>
            <p className="text-slate-500 text-sm">
              {resolvedParams.locale === 'en' ? 'You have no recent store orders.' : 'No tienes pedidos recientes.'}
            </p>
          </div>
        </div>
      </main>

      <HomeFooter locale={resolvedParams.locale} />
    </div>
  );
}
