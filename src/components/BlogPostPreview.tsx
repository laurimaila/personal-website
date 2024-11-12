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
                <div className="relative aspect-[16/9]">
                    <Image
                        unoptimized
                        priority={true}
                        fill
                        alt={post.title}
                        className="object-cover"
                        src={
                            post.banner
                                ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.banner}?format=avif`
                                : '/images/placeholder.webp'
                        }
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:col-span-2">
                    <h2 className="text-foreground font-sans text-2xl font-semibold tracking-tighter md:text-3xl">
                        {post.title}
                    </h2>
                    <div className="prose lg:prose-lg text-muted-foreground italic tracking-tighter">
                        {formatDate(post.date_created, 'dd MMMM yyyy')}
                    </div>
                    <div className="prose lg:prose-lg text-muted-foreground line-clamp-4 leading-relaxed md:text-lg">
                        {post.author}
                    </div>
                </div>
            </Link>
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
                'my-8 grid grid-cols-1 gap-16 md:my-16 md:grid-cols-2 lg:gap-28',
                className,
            )}>
            {posts.map((post) => (
                <BlogPostPreview key={post.id} post={post} />
            ))}
        </div>
    );
};
