import { PostEditor } from '@/components/blog/post-editor';
import { AppShell } from '@/components/panel/app-shell';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return (
    <AppShell title="Nuevo Artículo" subtitle="Crea una nueva entrada para el blog">
      <div className="py-6">
        <PostEditor />
      </div>
    </AppShell>
  );
}
