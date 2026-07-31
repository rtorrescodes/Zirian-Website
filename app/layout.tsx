import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zirian | Alta Ingeniería Eléctrica y Cargadores EV en Los Cabos",
  description: "Líderes en infraestructura para vehículos eléctricos, instalaciones eléctricas de alta gama, domótica y redes en Los Cabos y La Paz. Certificación NOM y CFE.",
  metadataBase: new URL("https://zirian.com"),
  openGraph: {
    type: "website",
    title: "Zirian | Alta Ingeniería Eléctrica y Cargadores EV en Los Cabos",
    description: "Líderes en infraestructura para vehículos eléctricos, instalaciones eléctricas de alta gama, domótica y redes en Los Cabos y La Paz. Certificación NOM y CFE.",
    url: "https://zirian.com",
    images: [
      {
        url: "/assets/images/hero_ev_charger.jpg",
        width: 1200,
        height: 630,
        alt: "Zirian EV Charging Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zirian | Ingeniería y Cargadores Eléctricos Los Cabos",
    description: "Servicios de alta ingeniería para residencias y comercios en Baja California Sur. Instalación de cargadores EV, automatización y seguridad.",
    images: ["/assets/images/hero_ev_charger.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <head>
        {/* Google Fonts Preconnect and Links */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Local Business Structured Data (SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Zirian EV Charging Solutions & Systems",
              "image": "https://zirian.com/assets/images/logo.png",
              "@id": "https://zirian.com/#localbusiness",
              "url": "https://zirian.com",
              "telephone": "+526246220525",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Carr. Transpeninsular Km. 24",
                "addressLocality": "San José del Cabo",
                "addressRegion": "BCS",
                "postalCode": "23400",
                "addressCountry": "MX",
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 22.9835,
                "longitude": -109.7088,
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
                "opens": "08:00",
                "closes": "18:00",
              },
              "sameAs": ["https://www.facebook.com/zirian"],
            }),
          }}
        />
      </head>
      <body className="min-h-full font-sans antialiased text-slate-100 bg-brand-dark">
        {children}
      </body>
    </html>
  );
}
