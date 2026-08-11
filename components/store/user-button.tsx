'use client';
import { signIn, signOut, useSession, SessionProvider } from 'next-auth/react';
import { LogIn, LogOut, User } from 'lucide-react';
import Link from 'next/link';

function UserButtonInner({ locale }: { locale: string }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-full"></div>;
  }

  if (session && session.user) {
    return (
      <div className="relative group flex items-center">
        {session.user.image ? (
          <img src={session.user.image} alt={session.user.name || 'User'} className="h-8 w-8 rounded-full border border-brand-cyan cursor-pointer" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-brand-cyan cursor-pointer">
            <User className="h-4 w-4 text-brand-cyan" />
          </div>
        )}
        
        {/* Dropdown Menu */}
        <div className="absolute right-full top-0 mr-4 w-48 bg-brand-dark/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-300 z-50 p-2">
          <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
            <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
            <p className="text-[10px] text-brand-cyan truncate">{session.user.email}</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            {locale === 'en' ? 'Log out' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Link 
        href={`/${locale}/login`}
        className="text-slate-300 hover:text-brand-blue p-2 rounded-full transition-colors flex items-center justify-center"
      >
        <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </Link>
      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-brand-dark border border-brand-blue/30 text-brand-blue text-[10px] uppercase font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-[0_0_10px_rgba(0,210,255,0.2)] z-50">
        {locale === 'en' ? 'Sign In' : 'Entrar'}
      </div>
    </div>
  );
}

export function UserButton({ locale }: { locale: string }) {
  return (
    <UserButtonInner locale={locale} />
  );
}
