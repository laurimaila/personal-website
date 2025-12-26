export const revalidate = 3600; // 1 hour

import { config } from '@/config';
import { getPosts } from '@/lib/directus';
import { NextResponse } from 'next/server';
import RSS from 'rss';
import urlJoin from 'url-join';

const baseUrl = config.baseUrl;

export async function GET() {
    const result = await getPosts();

    const posts = result.map((post) => {
        return {
            title: post.title,
            description: post.title || '',
            url: urlJoin(baseUrl, `/blog/${post.slug}`),
            date: post.date_created || new Date(),
        };
    });

    const feed = new RSS({
        title: config.blog.name,
        description: config.blog.metadata.description,
        site_url: baseUrl,
        feed_url: urlJoin(baseUrl, '/rss'),
        pubDate: new Date(),
    });
    posts.forEach((post) => {
        feed.item(post);
    });

    const xml: string = feed.xml({ indent: true });

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/rss+xml',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET',
        },
    });
}
