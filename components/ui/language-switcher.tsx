'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract current locale from pathname. Default to es if not en.
  const currentLocale = pathname.startsWith('/en') ? 'en' : 'es';

  const switchLanguage = (newLocale: string) => {
    // Basic logic to swap /en/ or /es/ in the URL
    if (currentLocale === newLocale) return;
    
    let newPath;
    if (newLocale === 'en') {
      newPath = `/en${pathname === '/' || pathname === '/es' ? '' : pathname.replace('/es', '')}`;
    } else {
      newPath = `/es${pathname === '/en' ? '' : pathname.replace('/en', '')}`;
    }
    
    // Fallback if the path replacement is buggy
    if (!newPath || newPath === '') newPath = `/${newLocale}`;
    
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2 bg-brand-charcoal/50 border border-brand-border rounded-full px-2 py-1">
      <Globe className="w-4 h-4 text-brand-green" />
      <button 
        onClick={() => switchLanguage('es')}
        className={`text-sm font-tech font-bold px-2 py-1 rounded-full transition-colors ${currentLocale === 'es' ? 'bg-brand-green text-brand-dark' : 'opacity-60 hover:opacity-100'}`}
        title="Español"
      >
        🇲🇽
      </button>
      <button 
        onClick={() => switchLanguage('en')}
        className={`text-sm font-tech font-bold px-2 py-1 rounded-full transition-colors ${currentLocale === 'en' ? 'bg-brand-green text-brand-dark' : 'opacity-60 hover:opacity-100'}`}
        title="English"
      >
        🇺🇸
      </button>
    </div>
  );
}
