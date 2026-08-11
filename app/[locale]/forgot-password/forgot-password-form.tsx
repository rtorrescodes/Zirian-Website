'use client';
import { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { requestPasswordReset } from './actions';

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isEn = locale === 'en';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await requestPasswordReset(email);
      if (res.error) {
        setError(res.error);
      } else {
        setMessage(isEn 
          ? 'If an account exists, a reset link has been sent (check console for now).' 
          : 'Si la cuenta existe, se ha enviado un enlace (revisa la consola por ahora).');
      }
    } catch (err) {
      setError(isEn ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-brand-cyan/10 border border-brand-cyan/50 text-brand-cyan text-sm p-3 rounded-lg text-center">
          {message}
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

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-brand-blue hover:bg-brand-cyan text-black hover:text-black font-bold font-title uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <>
            {isEn ? 'Send Reset Link' : 'Enviar Enlace'}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="text-center text-sm text-slate-400 mt-6">
        <a href={`/${locale}/login`} className="text-brand-cyan hover:text-white font-bold transition-colors">
          {isEn ? 'Back to Login' : 'Volver a Iniciar Sesión'}
        </a>
      </div>
    </form>
  );
}
