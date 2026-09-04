import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PageEs from './page-es';
import PageEn from './page-en';

export async function generateMetadata({ params }: { params: { locale: string } | Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'es';

  if (locale === 'en') {
    return {
      title: "Zirian | High-End Engineering, EV Chargers & HVAC | Los Cabos & Riviera Maya",
      description: "Leaders in electric vehicle infrastructure, high-efficiency air conditioning (AUFIT), high-end electrical installations, and smart automation in Los Cabos, La Paz, and Riviera Maya (Cancún, Playa del Carmen, Tulum).",
      alternates: {
        languages: {
          'es': '/es',
          'en': '/en',
        },
      },
    };
  }

  return {
    title: "Zirian | Alta Ingeniería, Cargadores EV y Climatización | Los Cabos & Riviera Maya",
    description: "Líderes en infraestructura para vehículos eléctricos, aire acondicionado de alta eficiencia (AUFIT), instalaciones eléctricas de alta gama y domótica en Los Cabos, La Paz y Riviera Maya (Cancún, Playa del Carmen, Tulum). Certificación NOM y CFE.",
    alternates: {
      languages: {
        'es': '/es',
        'en': '/en',
      },
    },
  };
}

export default async function LocalePage({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale;
  console.log('LOCALE PAGE PARAMS:', resolvedParams, 'EXTRACTED LOCALE:', locale);

  if (locale === 'es') {
    return <PageEs />;
  }
  if (locale === 'en') {
    return <PageEn />;
  }
  
  console.log('LOCALE NOT FOUND, CALLING NOTFOUND()');
  notFound();
}
