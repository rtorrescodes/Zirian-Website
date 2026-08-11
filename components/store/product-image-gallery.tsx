'use client';

import { useState } from 'react';

interface ProductImageGalleryProps {
  portada: string;
  title: string;
  images?: { imagen: string; orden: string }[];
}

export function ProductImageGallery({ portada, title, images }: ProductImageGalleryProps) {
  const getHighRes = (url: string) => {
    return url || '';
  };

  const allImages = [portada];
  
  if (images && images.length > 0) {
    images.forEach(img => {
      // Don't add if it's the exact same as portada
      if (img.imagen !== portada) {
        allImages.push(img.imagen);
      }
    });
  }

  const [mainImage, setMainImage] = useState(allImages[0]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Main Image */}
      <div className="aspect-square bg-white relative p-8 flex items-center justify-center overflow-hidden rounded-2xl w-full">
        <img 
          src={getHighRes(mainImage)} 
          alt={title}
          className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-110"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`relative flex-shrink-0 w-20 h-20 bg-white rounded-lg p-2 border-2 transition-all ${
                mainImage === img ? 'border-brand-cyan shadow-[0_0_10px_rgba(0,163,255,0.3)]' : 'border-transparent hover:border-slate-400'
              }`}
            >
              <img 
                src={img} 
                alt={`${title} view ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
