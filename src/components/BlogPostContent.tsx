'use server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { BlogPost } from '@/lib/directus';

export const PostContent = ({ content }: { content: string }) => {
    return (
        <div className="blog-content mx-auto min-h-60 md:min-h-80">
            <MDXRemote source={content} />
        </div>
    );
};

export const BlogPostContent = ({ post }: { post: BlogPost }) => {
    if (!post) return null;
    const { title, date_created, date_updated, author, content } = post;
    return (
        <div>
            <div className="prose lg:prose-xl dark:prose-invert lg:prose-h1:text-4xl mx-auto mb-10 break-words lg:mt-20">
                <h1 className="lg:mb-4">{title}</h1>
                <div className="mt-4 text-sm opacity-40 lg:mb-7 lg:mt-0">
                    {Intl.DateTimeFormat('fi-FI').format(new Date(date_updated || date_created)) +
                        ' ' +
                        author}
                </div>
                <PostContent content={content} />
            </div>
        </div>
    );
};
