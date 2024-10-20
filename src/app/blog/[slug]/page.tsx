import { BlogPostContent } from '@/components/BlogPostContent';
import { notFound } from 'next/navigation';
import { getPosts, getPostBySlug } from '@/lib/directus';
import type { BlogPosting, WithContext } from 'schema-dts';

export const dynamicParams = true;
export const revalidate = 60;

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
            title: 'Blog post not found',
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

const Page = async (props: { params: Promise<{ slug: string }> }) => {
    const params = await props.params;
    const post = await getPostBySlug(params.slug);

    if (!post) {
        return notFound();
    }

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
            //    image: author.image ?? undefined,
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
                {/*<RelatedPosts posts={posts} />*/}
            </div>
        </>
    );
};

export default Page;
