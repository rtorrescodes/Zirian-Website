"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD') // remove diacritics
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: number) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function getPosts() {
  return await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPublishedPosts() {
  return await prisma.post.findMany({
    where: { status: 'Published' },
    orderBy: { publishedAt: 'desc' }
  });
}

export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: { slug }
  });
}

export async function getPostById(id: number) {
  return await prisma.post.findUnique({
    where: { id }
  });
}

export async function createPost(data: { title: string; title_en?: string | null; content: string; content_en?: string | null; excerpt?: string | null; excerpt_en?: string | null; featured_image?: string | null; status: string; category?: string | null; template?: string | null; }) {
  const baseSlug = generateSlug(data.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const post = await prisma.post.create({
    data: {
      ...data,
      slug,
      publishedAt: data.status === 'Published' ? new Date() : null
    }
  });

  revalidatePath('/admin/blog');
  return post;
}

export async function updatePost(id: number, data: { title: string; title_en?: string | null; content: string; content_en?: string | null; excerpt?: string | null; excerpt_en?: string | null; featured_image?: string | null; status: string; category?: string | null; template?: string | null; }) {
  const postBefore = await prisma.post.findUnique({ where: { id } });
  
  let slug = postBefore?.slug || generateSlug(data.title);
  
  // If title changed, we might want to update slug, but usually SEO best practice is to keep the slug the same unless forced.
  // We'll just keep the existing slug for now, unless it's missing for some reason.
  if (!slug) {
    slug = await ensureUniqueSlug(generateSlug(data.title), id);
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      slug,
      // Only set publishedAt if transitioning from Draft to Published
      publishedAt: data.status === 'Published' && postBefore?.status !== 'Published' ? new Date() : postBefore?.publishedAt
    }
  });

  revalidatePath('/admin/blog');
  revalidatePath(`/admin/blog/editor/${id}`);
  return post;
}

export async function deletePost(id: number) {
  await prisma.post.delete({
    where: { id }
  });
  revalidatePath('/admin/blog');
}
