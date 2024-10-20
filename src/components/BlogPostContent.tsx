'use server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { BlogPost } from '@/lib/directus';

export const PostContent = ({ content }: { content: string }) => {
    return (
        <div className="blog-content mx-auto">
            <MDXRemote source={content} />
        </div>
    );
};

export const BlogPostContent = ({ post }: { post: BlogPost }) => {
    if (!post) return null;
    const { title, date_created, date_updated, author, content } = post;
    return (
        <div>
            <div className="prose lg:prose-xl dark:prose-invert mx-auto lg:prose-h1:text-4xl mb-10 lg:mt-20 break-words">
                <h1 className="lg:mb-4">{title}</h1>
                <div className="text-sm opacity-40 mt-4 lg:mb-7 lg:mt-0">
                    {Intl.DateTimeFormat('fi-FI').format(new Date(date_updated || date_created)) +
                        ' ' +
                        author}
                </div>
                <PostContent content={content} />
            </div>
        </div>
    );
};
