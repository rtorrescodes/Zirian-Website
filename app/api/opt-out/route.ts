import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  // Set the opt-out cookie for 10 years
  cookieStore.set("ignore_analytics", "true", {
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years in seconds
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Return a visually appealing HTML page confirming the opt-out status
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rastreo Desactivado - Zirian</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;800;900&family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0B0F19;
          background-image: radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 40%),
                            radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent 40%);
        }
        h1, h2, h3, button {
          font-family: 'Barlow', sans-serif;
        }
      </style>
    </head>
    <body class="min-h-screen flex flex-col justify-center items-center text-slate-100 p-6">
      <div class="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center backdrop-blur-md relative overflow-hidden">
        {/* Glow accent */}
        <div class="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
        
        {/* Shield/Check Icon */}
        <div class="w-16 h-16 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 class="text-2xl font-black uppercase tracking-wide text-white mb-2">
          Rastreo Desactivado
        </h1>
        <p class="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold mb-4">
          Opt-Out Exitoso
        </p>
        
        <p class="text-sm text-slate-400 leading-relaxed mb-8">
          Se ha establecido la cookie <code class="bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-mono text-xs">ignore_analytics</code>. 
          Tus visitas y acciones como administrador o desarrollador no serán registradas en Google Analytics ni píxeles de marketing.
        </p>

        <a href="/" class="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition duration-300 shadow-lg shadow-blue-900/20 cursor-pointer">
          Volver al Inicio
        </a>
      </div>
      
      <footer class="mt-8 text-[10px] text-slate-650 font-mono uppercase tracking-wider">
        Zirian Systems • Desarrollo de Alta Ingeniería
      </footer>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
