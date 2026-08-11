'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: string;
  title: string;
  brand: string | null;
  model: string | null;
  image: string | null;
  priceMxn: number;
  locale: string;
}

export function AddToCartButton({ productId, title, brand, model, image, priceMxn, locale }: AddToCartButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          title,
          brand,
          model,
          image,
          priceMxn,
          quantity: 1,
        }),
      });

      if (res.status === 401) {
        router.push(`/${locale}/login`);
        return;
      }

      if (res.ok) {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || added}
      className={`w-full py-3 px-4 sm:px-6 rounded-xl font-bold font-title uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${
        added 
          ? 'bg-[#00FF41] text-black' 
          : 'bg-brand-blue hover:bg-white text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,210,255,0.2)]'
      }`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : added ? (
        <>
          {locale === 'en' ? 'Added to Cart!' : '¡Agregado al Carrito!'}
          <Check className="h-5 w-5" />
        </>
      ) : (
        <>
          {locale === 'en' ? 'Add to Cart' : 'Agregar al Carrito'}
          <ShoppingCart className="h-5 w-5" />
        </>
      )}
    </button>
  );
}
