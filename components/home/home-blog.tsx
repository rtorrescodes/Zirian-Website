'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublishedPosts } from '@/app/actions/blog';
import { BookOpen, ArrowRight } from 'lucide-react';

export function HomeBlog({ locale }: { locale: string }) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getPublishedPosts().then(data => {
      setPosts(data.slice(0, 4));
    });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="relative py-24 bg-brand-charcoal border-t border-brand-border">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
            Blog<span className="text-brand-green animate-pulse">_</span>
          </h2>
          <p className="mt-4 text-slate-400 font-mono text-sm max-w-2xl mx-auto">
            {locale === 'en' 
              ? 'Latest technical articles, guides, and success stories in electrical engineering and integration.' 
              : 'Últimos artículos técnicos, guías y casos de éxito en ingeniería eléctrica e integración.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group relative block bg-[#0B0F19] rounded-xl overflow-hidden border border-brand-border hover:border-brand-green/50 transition-colors">
              <div className="aspect-video w-full bg-slate-900 relative overflow-hidden">
                {post.featured_image ? (
                  <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-slate-700" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-brand-green/20 text-brand-green border border-brand-green/30 text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
                  Tech Blog
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500 font-mono mb-2 flex items-center justify-between">
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span className="text-white">Rodrigo Torres</span>
                </p>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-brand-green transition-colors line-clamp-2 mb-3">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3">
                  {post.excerpt || 'Haz clic para leer el artículo completo...'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/blog">
            <button className="px-8 py-3 bg-transparent border border-brand-green text-brand-green hover:bg-brand-green hover:text-brand-dark font-bold uppercase tracking-wider font-mono text-sm transition-colors rounded">
              {locale === 'en' ? 'View All Articles' : 'Ver Todos los Artículos'}
            </button>
          </Link>
        </div>
      </div>
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-premium-mesh-dark opacity-30"></div>
        {/* Dynamic moving glows */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-brand-cyan/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }}></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[80%] bg-brand-green/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '11s', animationDelay: '2s' }}></div>
      </div>
    </section>
  );
}
