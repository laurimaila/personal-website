import { BlogPostContent } from '@/components/BlogPostContent';
import { BlogPostNavigation } from '@/components/BlogPostNavigation';
import { notFound } from 'next/navigation';
import { getPosts, getPostBySlug } from '@/lib/directus';
import type { BlogPosting, WithContext } from 'schema-dts';

export const dynamicParams = true;
export const revalidate = 120; // Revalidate every 2 minutes

// Generate static pages for specified slugs
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const res = await getPostBySlug(params.slug);
  if (!res) {
    return {
      title: 'Blog post not found :(',
    };
  }

  const { title, content } = res;

  return {
    title,
    content,
    openGraph: {
      title,
      content,
    },
  };
}

function getAdjacentPosts(posts: any[], currentSlug: string) {
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { prevPost: null, nextPost: null };
  }

  // Assuming posts are ordered by date (newest first)
  // Previous post = newer post (index - 1)
  // Next post = older post (index + 1)
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return { prevPost, nextPost };
}

const Page = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const allPosts = await getPosts();
  const { prevPost, nextPost } = getAdjacentPosts(allPosts, params.slug);

  const { title, date_created, date_updated, author } = post;

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    datePublished: date_created ? date_created.toString() : undefined,
    dateModified: date_updated ? date_updated.toString() : undefined,
    author: {
      '@type': 'Person',
      name: author ?? undefined,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-5">
        <BlogPostContent post={post} />

        {/* Link to next/previous */}
        <BlogPostNavigation nextPost={nextPost} prevPost={prevPost} />
      </div>
    </>
  );
};

export default Page;
