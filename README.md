# Zirian | Tech Hub & Store

Este es el repositorio oficial del sitio web, tienda y CRM de **Zirian**, líderes en infraestructura de vehículos eléctricos, domótica de alta gama, paneles solares y redes empresariales en Los Cabos y La Paz.

El proyecto está construido sobre [Next.js](https://nextjs.org/) (App Router), utilizando TailwindCSS para estilos, Prisma como ORM para la base de datos PostgreSQL, e integrado con la API de Syscom para inventario en tiempo real.

## Desarrollo Local

Para correr el entorno de desarrollo local, asegúrate de configurar tu archivo `.env` con las variables de entorno necesarias (base de datos, DeepSeek API, Syscom, etc.).

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el sitio.
El panel de administración (CRM) se encuentra en `/admin`.

## Despliegue en Producción (Google Cloud Run)

Este proyecto está configurado para ser desplegado en **Google Cloud Run**, asegurando alta disponibilidad y escalabilidad automática.

Asegúrate de configurar todas las variables de entorno directamente en el gestor de secretos o en las variables de entorno del servicio en la consola de Google Cloud antes de cada despliegue.

## Tecnologías Principales

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons
- **Backend:** Next.js Server Actions & API Routes
- **Base de Datos:** PostgreSQL (Supabase) + Prisma ORM
- **IA:** DeepSeek API
- **APIs de Terceros:** API de Syscom, Google Maps
