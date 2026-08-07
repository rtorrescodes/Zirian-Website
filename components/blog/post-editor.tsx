'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { createPost, updatePost } from '@/app/actions/blog';

interface PostEditorProps {
  initialData?: {
    id: number;
    title: string;
    content: string;
    excerpt?: string | null;
    featured_image?: string | null;
    status: string;
  };
}

export function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    status: initialData?.status || 'Draft',
    featured_image: initialData?.featured_image || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (initialData?.id) {
        await updatePost(initialData.id, formData);
      } else {
        await createPost(formData);
      }
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Hubo un error al guardar. Revisa la consola.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {initialData ? 'Editar Artículo' : 'Nuevo Artículo'}
          </h1>
          <p className="text-sm text-muted-foreground">Escribe o edita el contenido para tu blog o guías.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Título del Artículo</label>
              <Input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej. Mejores Prácticas para Paneles Solares..."
                className="h-12 text-lg font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Extracto (Resumen corto)</label>
              <Textarea 
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Un breve resumen que aparecerá en las tarjetas..."
                className="h-20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contenido Principal</label>
              <Textarea 
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Escribe el contenido completo aquí. Puedes usar Markdown..."
                className="min-h-[400px] font-mono text-sm leading-relaxed"
                required
              />
              <p className="text-xs text-muted-foreground">Puedes escribir en texto plano o usar Markdown para estructurar el artículo.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-slate-50/50 p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Publicación</h3>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Estatus</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Draft">Borrador</option>
                  <option value="Published">Publicado</option>
                </select>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full bg-brand-cyan hover:bg-brand-cyan/90">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {initialData ? 'Guardar Cambios' : 'Crear Artículo'}
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 space-y-4 shadow-sm">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Media
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">URL de Imagen Principal</label>
                <Input 
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  placeholder="https://bucket.url/imagen.jpg"
                />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Nota: Proximamente conectaremos esto directamente con el uploader del Bucket. Por ahora puedes pegar una URL de imagen o dejarlo en blanco.
                </p>
              </div>
              
              {formData.featured_image && (
                <div className="aspect-video w-full rounded-lg border border-border overflow-hidden bg-slate-100">
                  <img src={formData.featured_image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          
        </div>
      </form>
    </div>
  );
}
