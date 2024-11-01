import { promises as fs } from 'fs';
import { notFound } from 'next/navigation';
import { BlogPostContent } from '@/components/BlogPostContent';
import matter from 'gray-matter';

interface PostFrontmatter {
    title: string;
    banner: string;
    date_created: string;
    date_updated: string;
    author: string;
}

const DevBlogPage = async (props: { params: Promise<{ slug: string }> }) => {
    const params = await props.params;
    let rawContent;
    try {
        rawContent = await fs.readFile(
            process.cwd() + `/src/content/posts/${params.slug}.mdx`,
            'utf8',
        );
    } catch (e) {
        return notFound();
    }

    const { data, content } = matter(rawContent);
    const fm = data as PostFrontmatter;

    const devPost = {
        id: 9001,
        title: fm.title,
        banner: fm.banner ? fm.banner : '',
        slug: params.slug,
        date_created: fm.date_created,
        date_updated: fm.date_updated,
        author: fm.author,
        content,
    };

    return (
        <>
            <div className="container mx-auto px-5">
                <BlogPostContent post={devPost} />
            </div>
        </>
    );
};

export default DevBlogPage;
