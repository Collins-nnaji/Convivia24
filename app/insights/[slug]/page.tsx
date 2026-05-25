import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InsightArticleView } from '@/components/insights/InsightArticleView';
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from '@/lib/insights/posts';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Insight not found' };

  return {
    title: `${post.title} | Convivia24 Insights`,
    description: post.dek,
    openGraph: {
      title: post.title,
      description: post.dek,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function InsightArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 3);

  return <InsightArticleView post={post} related={related} />;
}
