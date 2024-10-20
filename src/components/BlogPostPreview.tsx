'use client';
import { cn } from '@/lib/utils';
import { formatDate } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import type { BlogPost } from '@/lib/directus';

export const BlogPostPreview = ({ post }: { post: BlogPost }) => {
    return (
        <div className="break-words">
            <Link href={`/blog/${post.slug}`}>
                <div className="aspect-[16/9] relative">
                    <Image
                        alt={post.title}
                        className="object-cover"
                        src={'/images/placeholder.webp'}
                        fill
                    />
                </div>
            </Link>
            <div className="grid grid-cols-1 gap-3 md:col-span-2 mt-4">
                <h2 className="font-sans font-semibold tracking-tighter text-primary text-2xl md:text-3xl">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <div className="prose lg:prose-lg italic tracking-tighter text-muted-foreground">
                    {formatDate(post.date_created, 'dd MMMM yyyy')}
                </div>
                <div className="prose lg:prose-lg leading-relaxed md:text-lg line-clamp-4 text-muted-foreground">
                    {post.author}
                </div>
            </div>
        </div>
    );
};

export const BlogPostsPreview: FC<{ posts: BlogPost[]; className?: string }> = ({
    posts,
    className,
}) => {
    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-16 lg:gap-28 md:grid-cols-2 md:my-16 my-8',
                className,
            )}>
            {posts.map((post) => (
                <BlogPostPreview key={post.id} post={post} />
            ))}
        </div>
    );
};
