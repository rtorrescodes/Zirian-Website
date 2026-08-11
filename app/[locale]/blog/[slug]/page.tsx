import { getPostBySlug } from '@/app/actions/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Share2, ChevronRight, Zap, Shield, Wifi, ShoppingCart, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'
import { HomeHeader } from '@/components/home/home-header'
import { HomeFooter } from '@/components/home/home-footer'
import { SidebarEcommerceWidget } from '@/components/store/sidebar-ecommerce-widget'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string, locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug)
  if (!post) return { title: 'No encontrado' }

  const isEn = resolvedParams.locale === 'en';
  const title = isEn && post.title_en ? post.title_en : post.title;
  const excerpt = isEn && post.excerpt_en ? post.excerpt_en : post.excerpt;

  return {
    title: `${title} | Zirian Blog`,
    description: excerpt || `Zirian Blog - ${title}`,
    openGraph: {
      title: title,
      description: excerpt || '',
      images: post.featured_image ? [post.featured_image] : [],
    }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  const isEn = resolvedParams.locale === 'en';
  const title = isEn && post.title_en ? post.title_en : post.title;
  const excerpt = isEn && post.excerpt_en ? post.excerpt_en : post.excerpt;
  const content = isEn && post.content_en ? post.content_en : post.content;
  
  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-blue/30 selection:text-white">
      <HomeHeader locale={resolvedParams.locale} />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Back button */}
          <Link href="/#blog" className="inline-flex items-center text-sm font-tech font-bold text-slate-400 hover:text-brand-blue transition mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {isEn ? 'Back to Home' : 'Regresar a Inicio'}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* MAIN ARTICLE CONTENT (3 Columns) */}
            <article className="lg:col-span-3">
              <header className="mb-10">
                <div className="flex items-center gap-4 text-sm text-brand-green mb-6 font-tech uppercase tracking-widest">
                  <span className="bg-brand-green/10 border border-brand-green/30 px-3 py-1 rounded-sm text-xs font-bold">Tech Blog</span>
                  <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()} className="flex items-center text-slate-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString(isEn ? 'en-US' : 'es-MX', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </time>
                  <span className="text-white border-l border-slate-700 pl-4">
                    {isEn ? 'By' : 'Por'} <span className="font-bold">Rodrigo Torres</span>
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 font-title leading-tight">
                  {title}
                </h1>

                {excerpt && (
                  <p className="text-xl leading-relaxed text-slate-300 border-l-4 border-brand-blue pl-6 italic mb-8">
                    {excerpt}
                  </p>
                )}
              </header>

              {post.featured_image && (
                <div className="relative aspect-[2/1] w-full rounded-xl overflow-hidden mb-12 border border-slate-800 group">
                  <img 
                    src={post.featured_image} 
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent"></div>
                </div>
              )}

              {/* HTML CONTENT */}
              <div 
                className="prose prose-invert prose-lg max-w-none prose-headings:font-title prose-headings:text-white prose-a:text-brand-cyan hover:prose-a:text-brand-blue prose-img:rounded-xl prose-p:text-slate-300 prose-p:leading-loose prose-blockquote:border-l-brand-blue prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <hr className="my-12 border-slate-800" />

              {/* Article Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="font-tech text-sm uppercase tracking-widest text-slate-400">
                    {isEn ? 'Share article' : 'Compartir artículo'}
                  </span>
                  <div className="flex gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark border border-slate-700 text-slate-400 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <Link href="/cotizador" className="rounded bg-brand-green px-6 py-3 text-sm font-bold text-brand-dark shadow hover:bg-white hover:scale-105 transition-all font-tech uppercase tracking-wider">
                  {isEn ? 'Need an installation? Get a quote' : '¿Necesitas una instalación? Cotizar ahora'}
                </Link>
              </div>
            </article>

            {/* SIDEBAR WIDGET (1 Column) */}
            <aside className="lg:col-span-1 space-y-8 sticky top-28 h-fit hidden lg:block">
              <SidebarEcommerceWidget locale={resolvedParams.locale} />
              
              {/* CTA Widget */}
              <div className="bg-gradient-to-br from-brand-blue/20 to-brand-dark border border-brand-blue/30 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(0,163,255,0.1)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/20 rounded-full blur-2xl"></div>
                <Zap className="w-10 h-10 text-brand-blue mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 font-title">
                  {isEn ? 'Power your future' : 'Potencia tu futuro'}
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  {isEn ? 'EV Chargers, Solar Panels, and Smart Home automation by experts.' : 'Cargadores EV, Paneles Solares y Domótica por expertos.'}
                </p>
                <Link href="/cotizador" className="block w-full bg-brand-blue hover:bg-brand-blue/80 text-black font-bold py-3 rounded text-sm font-tech uppercase tracking-wider transition-colors relative z-10">
                  {isEn ? 'Get a Quote' : 'Cotizar Proyecto'}
                </Link>
              </div>

              {/* Categories Widget */}
              <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4 font-tech uppercase tracking-wider flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-brand-green" />
                  {isEn ? 'Expertise Areas' : 'Áreas de Experiencia'}
                </h3>
                <ul className="space-y-3">
                  {['Energía Solar (Solar Power)', 'Movilidad Eléctrica (EV)', 'Seguridad y CCTV', 'Redes WiFi'].map((cat, i) => (
                    <li key={i}>
                      <Link href="/#servicios" className="group flex items-center justify-between text-slate-400 hover:text-brand-green transition-colors text-sm">
                        <span>{cat}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Banner Widget */}
              <Link href={`/${resolvedParams.locale}/store`} className="block rounded-xl overflow-hidden relative aspect-square border border-slate-800 group">
                <img src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop" alt="Smart Home" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                    <ShoppingCart className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <p className="font-bold text-white text-xl font-title leading-tight mb-2">
                    {isEn ? 'Smart Home & Solar Store' : 'Tienda de Domótica y Energía Solar'}
                  </p>
                  <p className="text-xs text-brand-cyan mt-1 uppercase tracking-widest font-tech flex items-center gap-2">
                    {isEn ? 'Shop Now' : 'Visita la tienda'} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </p>
                </div>
              </Link>

            </aside>
          </div>
        </div>
      </main>

      <HomeFooter locale={resolvedParams.locale} />
    </div>
  )
}
