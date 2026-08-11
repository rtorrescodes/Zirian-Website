import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PageEs from './page-es';
import PageEn from './page-en';

export async function generateMetadata({ params }: { params: { locale: string } | Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'es';

  if (locale === 'en') {
    return {
      title: "Zirian | High-End Electrical Engineering & EV Chargers in Los Cabos",
      description: "Leaders in electric vehicle infrastructure, high-end electrical installations, smart home automation, and networks in Los Cabos and La Paz. CFE Certified.",
      alternates: {
        languages: {
          'es': '/es',
          'en': '/en',
        },
      },
    };
  }

  return {
    title: "Zirian | Alta Ingeniería Eléctrica y Cargadores EV en Los Cabos",
    description: "Líderes en infraestructura para vehículos eléctricos, instalaciones eléctricas de alta gama, domótica y redes en Los Cabos y La Paz. Certificación NOM y CFE.",
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
