'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function LoginForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEn = locale === 'en';

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (res?.error) {
        setError(isEn ? 'Invalid credentials' : 'Credenciales inválidas');
      } else {
        window.location.href = `/${locale}/portal`;
      }
    } catch (err) {
      setError(isEn ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: `/${locale}/portal` });
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
      >
        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
        {isEn ? 'Continue with Google' : 'Continuar con Google'}
      </button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">{isEn ? 'or' : 'o'}</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>

      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isEn ? 'Email address' : 'Correo electrónico'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-colors"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEn ? 'Password' : 'Contraseña'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-colors"
            required
          />
        </div>

        <div className="flex justify-end">
          <button type="button" className="text-xs text-brand-cyan hover:text-white transition-colors">
            {isEn ? 'Forgot password?' : '¿Olvidaste tu contraseña?'}
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-blue hover:bg-brand-cyan text-black hover:text-black font-bold font-title uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>
              {isEn ? 'Sign In' : 'Entrar'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      
      <div className="text-center text-sm text-slate-400 mt-6">
        {isEn ? "Don't have an account? " : "¿No tienes cuenta? "}
        <a href={`/${locale}/register`} className="text-brand-cyan hover:text-white font-bold transition-colors">
          {isEn ? 'Register here' : 'Regístrate aquí'}
        </a>
      </div>
    </div>
  );
}
