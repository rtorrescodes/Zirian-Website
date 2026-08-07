import { getPostById } from '@/app/actions/blog';
import { PostEditor } from '@/components/blog/post-editor';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/panel/app-shell';

export const dynamic = 'force-dynamic';

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <AppShell title={`Editar Artículo: ${post.title}`} subtitle="Actualiza el contenido del artículo">
      <div className="py-6">
        <PostEditor initialData={post} />
      </div>
    </AppShell>
  );
}
