import { getPosts } from '@/app/actions/blog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, BookOpen, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/panel/app-shell';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  const posts = await getPosts();

  return (
    <AppShell title="Blog & Guías" subtitle="Gestiona los artículos de mejores prácticas, guías y casos de éxito.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/blog/editor">
            <Button className="bg-brand-cyan hover:bg-brand-cyan/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Artículo
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Aún no hay publicaciones</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Comienza a compartir tu conocimiento creando el primer artículo o guía técnica.
              </p>
              <Link href="/admin/blog/editor" className="mt-6">
                <Button variant="outline">Crear mi primera publicación</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Título</th>
                    <th className="px-6 py-4 font-medium">Estatus</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.featured_image ? (
                            <img src={post.featured_image} alt="" className="h-10 w-10 rounded object-cover border border-border" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center border border-border">
                              <BookOpen className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{post.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {post.status === 'Published' ? (
                          <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">Publicado</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Borrador</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/blog/editor/${post.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-brand-cyan">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
