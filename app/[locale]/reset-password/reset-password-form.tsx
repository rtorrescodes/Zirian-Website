'use client';
import { useState } from 'react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { executePasswordReset } from './actions';

export function ResetPasswordForm({ locale, token }: { locale: string, token: string }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const isEn = locale === 'en';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await executePasswordReset(token, password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(isEn ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-[#00FF41]/10 border border-[#00FF41]/50 text-[#00FF41] text-sm p-4 rounded-lg mb-6 font-bold tracking-wide">
          {isEn 
            ? 'Your password has been successfully reset.' 
            : 'Tu contraseña ha sido actualizada con éxito.'}
        </div>
        <a href={`/${locale}/login`} className="bg-brand-blue hover:bg-brand-cyan text-black hover:text-black font-bold font-title uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          {isEn ? 'Go to Login' : 'Ir a Iniciar Sesión'}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
          {error}
        </div>
      )}
      
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEn ? 'New Password (min 6)' : 'Nueva Contraseña (min 6)'}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-colors"
          required
          minLength={6}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-brand-green hover:bg-[#00FF41] text-black font-bold font-title uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <>
            {isEn ? 'Save Password' : 'Guardar Contraseña'}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
