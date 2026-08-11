'use client';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function CartWidget({ locale }: { locale: string }) {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetch('/api/cart')
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            const total = data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
            setCount(total);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  return (
    <Link 
      href={`/${locale}/store/cart`} 
      className="relative p-2 text-slate-300 hover:text-brand-cyan transition-colors group"
    >
      <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-brand-dark transform translate-x-1/4 -translate-y-1/4 bg-[#00FF41] rounded-full shadow-[0_0_10px_#00FF41]">
          {count}
        </span>
      )}
    </Link>
  );
}
