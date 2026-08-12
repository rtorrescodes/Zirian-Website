'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, ArrowLeft, Image as ImageIcon, Sparkles, Wand2, Bot } from 'lucide-react';
import Link from 'next/link';
import { createPost, updatePost, getBlogCategories } from '@/app/actions/blog';
import { generateBlogIdeas, generateFullArticle, editArticleContent } from '@/app/actions/blog-ai';
import 'quill/dist/quill.snow.css';

interface PostEditorProps {
  initialData?: {
    id: number;
    title: string;
    title_en?: string | null;
    content: string;
    content_en?: string | null;
    excerpt?: string | null;
    excerpt_en?: string | null;
    featured_image?: string | null;
    category?: string | null;
    status: string;
    template?: string;
  };
}

export function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    title_en: initialData?.title_en || '',
    excerpt: initialData?.excerpt || '',
    excerpt_en: initialData?.excerpt_en || '',
    content: initialData?.content || '',
    content_en: initialData?.content_en || '',
    status: initialData?.status || 'Draft',
    featured_image: initialData?.featured_image || '',
    category: initialData?.category || '',
    template: initialData?.template || 'standard'
  });

  const [aiTopic, setAiTopic] = useState('');
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Edit state
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isEditingAi, setIsEditingAi] = useState(false);

  // Raw Quill Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const isInitializing = useRef(false);

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    getBlogCategories().then(setAvailableCategories).catch(console.error);

    if (typeof window !== 'undefined' && editorRef.current && !quillInstance.current && !isInitializing.current) {
      isInitializing.current = true;
      import('quill').then((QuillModule) => {
        if (quillInstance.current) return;
        const Quill = QuillModule.default;
        
        quillInstance.current = new Quill(editorRef.current!, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ 'header': [2, 3, 4, false] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
              ['link', 'image', 'code-block'],
              ['clean']
            ]
          }
        });

        // Initialize content
        if (formData.content) {
          quillInstance.current.clipboard.dangerouslyPasteHTML(formData.content);
        }

        quillInstance.current.on('text-change', () => {
          setFormData(prev => ({ ...prev, content: quillInstance.current.root.innerHTML }));
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateIdeas = async () => {
    if (!aiTopic) return alert('Escribe un tema primero');
    setIsGenerating(true);
    try {
      const ideas = await generateBlogIdeas(aiTopic);
      setAiIdeas(ideas);
    } catch (e) {
      console.error(e);
      alert('Error generando ideas con DeepSeek');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateArticle = async (title: string, summary: string) => {
    setIsGenerating(true);
    try {
      const article = await generateFullArticle(title);
      const generatedContent = `<h2>Introducción</h2>\n<p>${article.blocks.intro}</p>\n\n<blockquote>${article.blocks.quote}</blockquote>\n\n<p>${article.blocks.section1}</p>\n\n<p>${article.blocks.section2}</p>\n\n${article.blocks.main}`;
      const generatedContentEn = `<h2>Introduction</h2>\n<p>${article.blocks_en.intro}</p>\n\n<blockquote>${article.blocks_en.quote}</blockquote>\n\n<p>${article.blocks_en.section1}</p>\n\n<p>${article.blocks_en.section2}</p>\n\n${article.blocks_en.main}`;
      
      setFormData(prev => ({
        ...prev,
        title: article.title,
        title_en: article.title_en,
        excerpt: article.meta || summary,
        excerpt_en: article.meta_en,
        content: generatedContent,
        content_en: generatedContentEn,
        featured_image: article.image_url
      }));

      if (quillInstance.current) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(generatedContent);
      }
      
      setAiIdeas([]);
    } catch (e) {
      console.error(e);
      alert('Error redactando artículo con DeepSeek');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiEdit = async () => {
    if (!aiEditPrompt || !formData.content) return;
    setIsEditingAi(true);
    try {
      const newContent = await editArticleContent(aiEditPrompt, formData.content);
      setFormData(prev => ({ ...prev, content: newContent }));
      
      if (quillInstance.current) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(newContent);
      }
      
      setAiEditPrompt('');
    } catch (e) {
      console.error(e);
      alert('Error editando con DeepSeek');
    } finally {
      setIsEditingAi(false);
    }
  };

  // SEO Helpers
  const getTitleScore = () => {
    const len = formData.title.length;
    if (len === 0) return { color: 'text-slate-500', bg: 'bg-slate-500', text: 'Vacío' };
    if (len >= 40 && len <= 60) return { color: 'text-brand-green', bg: 'bg-brand-green', text: 'Óptimo' };
    if (len > 60) return { color: 'text-orange-500', bg: 'bg-orange-500', text: 'Muy largo' };
    return { color: 'text-orange-500', bg: 'bg-orange-500', text: 'Muy corto' };
  };

  const getMetaScore = () => {
    const len = formData.excerpt?.length || 0;
    if (len === 0) return { color: 'text-slate-500', bg: 'bg-slate-500', text: 'Vacío' };
    if (len >= 120 && len <= 160) return { color: 'text-brand-green', bg: 'bg-brand-green', text: 'Óptimo' };
    if (len > 160) return { color: 'text-orange-500', bg: 'bg-orange-500', text: 'Muy largo' };
    return { color: 'text-orange-500', bg: 'bg-orange-500', text: 'Muy corto' };
  };

  const getContentScore = () => {
    const text = formData.content.replace(/<[^>]*>?/gm, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    if (words === 0) return { color: 'text-slate-500', bg: 'bg-slate-500', text: '0 palabras' };
    if (words >= 300) return { color: 'text-brand-green', bg: 'bg-brand-green', text: `${words} palabras (Óptimo)` };
    return { color: 'text-orange-500', bg: 'bg-orange-500', text: `${words} palabras (Poco)` };
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
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-slate-900 border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-tech uppercase">
            {initialData ? 'Editar Artículo' : 'Nuevo Artículo'}
          </h1>
          <p className="text-sm text-slate-400">Escribe o edita el contenido con Quill y DeepSeek.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            
            {/* AI GENERATOR SECTION */}
            {!initialData && (
              <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 p-6 mb-8">
                <h3 className="text-lg font-bold text-brand-cyan flex items-center mb-4 font-tech uppercase tracking-wider">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Creador IA (DeepSeek)
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input 
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Escribe un tema... (ej. Beneficios de paneles solares)"
                    className="flex-1 bg-slate-900 border-brand-cyan/20 text-white placeholder:text-slate-500 h-12"
                  />
                  <button 
                    type="button" 
                    onClick={handleGenerateIdeas} 
                    disabled={isGenerating} 
                    className="flex items-center justify-center h-12 px-8 rounded-lg bg-[#00A3FF] hover:bg-[#00A3FF]/80 text-black font-extrabold uppercase tracking-wider font-tech shadow-lg transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                    Generar Ideas
                  </button>
                </div>
                
                {aiIdeas.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-brand-cyan font-semibold">Ideas sugeridas:</p>
                    {aiIdeas.map((idea, i) => (
                      <div key={i} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg flex justify-between items-center gap-4">
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{idea.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{idea.summary}</p>
                        </div>
                        <Button type="button" onClick={() => handleGenerateArticle(idea.title, idea.summary)} disabled={isGenerating} size="sm" variant="outline" className="border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-slate-950 whitespace-nowrap">
                          Redactar Artículo
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 font-tech uppercase tracking-wider">Título del Artículo</label>
              <Input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej. Mejores Prácticas para Paneles Solares..."
                className="h-12 text-lg font-medium bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 font-tech uppercase tracking-wider">Extracto SEO</label>
              <Textarea 
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Un breve resumen que aparecerá en las tarjetas y metas de Google..."
                className="h-20 resize-none bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 font-tech uppercase tracking-wider">Contenido Principal (Editor Visual)</label>
              <div className="bg-slate-950 rounded-md overflow-hidden text-slate-200 border border-slate-700 quill-dark relative">
                <div ref={editorRef} className="min-h-[400px]"></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* AI Editor Panel (Like Codanta) */}
            <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 p-5 space-y-4 shadow-sm">
              <h3 className="font-semibold text-brand-green flex items-center gap-2 font-tech uppercase tracking-wider text-sm">
                <Bot className="h-4 w-4" />
                Editor de IA
              </h3>
              <p className="text-xs text-slate-400">Pídele a DeepSeek que modifique el contenido actual. Ej: "Hazlo más persuasivo" o "Agrega una conclusión".</p>
              
              <Textarea 
                value={aiEditPrompt}
                onChange={(e) => setAiEditPrompt(e.target.value)}
                placeholder="Instrucciones para la IA..."
                className="h-24 resize-none bg-slate-900 border-brand-green/20 text-white text-sm"
              />
              <Button type="button" onClick={handleAiEdit} disabled={isEditingAi || !formData.content} className="w-full bg-transparent border border-brand-green text-brand-green hover:bg-brand-green hover:text-slate-950 font-tech uppercase tracking-wider font-bold transition-colors">
                {isEditingAi ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Aplicar Cambios
              </Button>
            </div>

            {/* Mini Yoast SEO Panel */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="font-semibold text-slate-200 font-tech uppercase tracking-wider text-sm flex items-center justify-between">
                Análisis SEO
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Mini Yoast</span>
              </h3>
              
              <div className="space-y-3">
                {/* Title */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Título ({formData.title.length} car.)</span>
                  <div className="flex items-center gap-2">
                    <span className={getTitleScore().color}>{getTitleScore().text}</span>
                    <div className={`w-2 h-2 rounded-full ${getTitleScore().bg}`}></div>
                  </div>
                </div>
                {/* Meta */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Meta/Extracto ({formData.excerpt?.length || 0} car.)</span>
                  <div className="flex items-center gap-2">
                    <span className={getMetaScore().color}>{getMetaScore().text}</span>
                    <div className={`w-2 h-2 rounded-full ${getMetaScore().bg}`}></div>
                  </div>
                </div>
                {/* Content */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Longitud Contenido</span>
                  <div className="flex items-center gap-2">
                    <span className={getContentScore().color}>{getContentScore().text}</span>
                    <div className={`w-2 h-2 rounded-full ${getContentScore().bg}`}></div>
                  </div>
                </div>
              </div>

              {/* Google Snippet Preview */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2 font-mono">Vista Previa Google:</p>
                <div className="bg-white p-3 rounded-md">
                  <div className="text-[11px] text-[#202124] mb-1 truncate">zirian.mx &gt; blog &gt; <span className="text-[#4d5156]">{formData.title ? formData.title.toLowerCase().replace(/[\s\W-]+/g, '-') : '...'}</span></div>
                  <div className="text-[#1a0dab] text-sm font-medium mb-1 truncate">{formData.title || 'Título del artículo'}</div>
                  <div className="text-[#4d5156] text-[11px] line-clamp-2 leading-tight">
                    {formData.excerpt || 'La meta descripción aparecerá aquí...'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="font-semibold text-slate-200 font-tech uppercase tracking-wider text-sm">Publicación</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-tech uppercase">Categoría</label>
                <Input 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  list="category-options"
                  placeholder="Ej. Paneles Solares, EcoFlow, Redes..."
                  className="h-10 bg-slate-950 border-slate-700 text-slate-200 text-sm"
                />
                <datalist id="category-options">
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-tech uppercase">Plantilla (Template)</label>
                <select 
                  name="template" 
                  value={formData.template} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                >
                  <option value="standard">Estándar</option>
                  <option value="hero">Hero / Principal</option>
                  <option value="minimalist">Minimalista</option>
                  <option value="terminal">Cyber/Terminal</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-tech uppercase">Estatus</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                >
                  <option value="Draft">Borrador</option>
                  <option value="Published">Publicado</option>
                </select>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 font-bold uppercase tracking-wider font-tech mt-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {initialData ? 'Guardar Cambios' : 'Crear Artículo'}
              </Button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2 font-tech uppercase tracking-wider text-sm">
                <ImageIcon className="h-4 w-4 text-slate-400" />
                Media
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-tech uppercase">URL de Imagen Principal</label>
                <Input 
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="bg-slate-950 border-slate-700 text-slate-200 text-sm"
                />
              </div>
              
              {formData.featured_image && (
                <div className="aspect-video w-full rounded-lg border border-slate-700 overflow-hidden bg-slate-950">
                  <img src={formData.featured_image} alt="Preview" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </div>
          
        </div>
      </form>
    </div>
  );
}
