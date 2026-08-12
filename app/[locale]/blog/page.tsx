import { getPublishedPosts } from '@/app/actions/blog'
import Link from 'next/link'
import { FileText, ArrowRight, Calendar, Tag, ChevronRight } from 'lucide-react'
import { HomeHeader } from '@/components/home/home-header'
import { HomeFooter } from '@/components/home/home-footer'
import { SidebarEcommerceWidget } from '@/components/store/sidebar-ecommerce-widget'
import { FeaturedProductWidget } from '@/components/store/featured-product-widget'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const posts = await getPublishedPosts()
  const resolvedParams = await params;
  const isEn = resolvedParams.locale === 'en';
  
  // Calculate categories
  const categoriesCount = posts.reduce((acc, post) => {
    const cat = post.category || 'Tech Blog';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-blue/30 selection:text-white">
      <HomeHeader locale={resolvedParams.locale} />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-brand-border bg-brand-charcoal py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-premium-mesh-dark opacity-40"></div>
          {/* Dynamic moving glows */}
          <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-brand-cyan/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[120%] bg-brand-green/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mt-12">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-title uppercase">
              Tech <span className="text-brand-cyan">Hub</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              {isEn 
                ? 'Technical guides, best practices, and deep dives into solar panels, CCTV infrastructure, enterprise WiFi networks, and the EV charger revolution.'
                : 'Guías técnicas, mejores prácticas y análisis profundos sobre paneles solares, infraestructura de CCTV, redes WiFi empresariales y la revolución de cargadores EV en México.'}
            </p>
          </div>
        </div>
      </section>

      {/* GRID DE PUBLICACIONES CON SIDEBAR */}
      <div className="relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Subtle grid background for the main content area */}
          <div className="absolute inset-0 bg-premium-mesh-dark opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
        
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Posts */}
          <div className="lg:col-span-2">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                <FileText className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-300 font-title uppercase">
                  {isEn ? 'No posts available' : 'No hay publicaciones disponibles'}
                </h3>
                <p className="text-slate-500 mt-2">
                  {isEn ? 'Check back soon for our latest tech content.' : 'Vuelve pronto para leer nuestro contenido tecnológico.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {posts.map((post) => {
                  const title = isEn && post.title_en ? post.title_en : post.title;
                  const excerpt = isEn && post.excerpt_en ? post.excerpt_en : post.excerpt;

                  return (
                    <article key={post.id} className="group relative flex flex-col items-start justify-between bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-brand-blue/50 hover:shadow-[0_0_20px_rgba(0,163,255,0.15)] transition-all duration-300">
                      {post.featured_image && (
                        <div className="w-full aspect-[16/9] overflow-hidden relative">
                          <img 
                            src={post.featured_image} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 bg-brand-green/20 text-brand-green border border-brand-green/30 text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
                            {post.category || 'Tech Blog'}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col p-6 w-full flex-1">
                        <div className="flex items-center justify-between text-xs w-full">
                          <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()} className="text-slate-500 flex items-center font-tech">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(isEn ? 'en-US' : 'es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          <span className="text-brand-cyan flex items-center font-tech font-bold">
                            Rodrigo Torres
                          </span>
                        </div>
                        <div className="group relative mt-4 flex-1">
                          <h3 className="text-lg font-bold leading-6 text-white group-hover:text-brand-cyan transition-colors line-clamp-2">
                            <Link href={`/${resolvedParams.locale}/blog/${post.slug}`}>
                              <span className="absolute inset-0" />
                              {title}
                            </Link>
                          </h3>
                          {excerpt && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                              {excerpt}
                            </p>
                          )}
                        </div>
                        <div className="mt-6 flex items-center gap-x-2 text-sm font-semibold text-brand-blue font-tech uppercase tracking-wider">
                          {isEn ? 'Read more' : 'Leer más'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="sticky top-28 space-y-8">
              <SidebarEcommerceWidget locale={resolvedParams.locale} />
              <FeaturedProductWidget locale={resolvedParams.locale} />
              
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-title font-bold text-white uppercase tracking-wider mb-6 flex items-center border-b border-slate-800 pb-4">
                <Tag className="h-5 w-5 mr-2 text-brand-green" />
                {isEn ? 'Categories' : 'Categorías'}
              </h3>
              <ul className="space-y-3">
                {Object.entries(categoriesCount).map(([category, count]) => (
                  <li key={category}>
                    <a href="#" className="flex items-center justify-between group">
                      <span className="text-slate-400 group-hover:text-brand-green transition-colors flex items-center text-sm font-mono">
                        <ChevronRight className="h-4 w-4 mr-2 text-slate-600 group-hover:text-brand-green transition-colors" />
                        {category}
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-tech">
                        {String(count)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Promo Widget */}
            <div className="bg-gradient-to-br from-brand-blue/20 to-brand-cyan/5 border border-brand-blue/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-cyan/20 rounded-full blur-[40px]"></div>
              <h3 className="text-lg font-title font-bold text-white uppercase tracking-wider mb-2 relative z-10">
                {isEn ? 'Need an expert?' : '¿Buscas un experto?'}
              </h3>
              <p className="text-sm text-slate-300 mb-6 relative z-10">
                {isEn 
                  ? 'Get a quote for your next smart home or EV charger installation project.' 
                  : 'Cotiza tu próximo proyecto de domótica o instalación de cargadores EV.'}
              </p>
              <Link href={`/${resolvedParams.locale}/#cotizador`} className="inline-block relative z-10 w-full text-center bg-[#00FF41] text-black px-4 py-3 rounded-lg font-bold font-title uppercase text-sm tracking-wider hover:bg-[#00FF41]/80 hover:scale-105 transition-all shadow-lg">
                {isEn ? 'Get Quote' : 'Cotizar Ahora'}
              </Link>
            </div>
          </div>
          </aside>
        </div>
        </main>
      </div>

      <HomeFooter locale={resolvedParams.locale} />
    </div>
  )
}
