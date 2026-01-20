export const revalidate = 3600; // 1 hour

import { config } from '@/config';
import { getPosts } from '@/lib/directus';
import { NextResponse } from 'next/server';
import RSS from 'rss';
import urlJoin from 'url-join';

const baseUrl = config.baseUrl;

export async function GET() {
  const allPosts = await getPosts();

  const feed = new RSS({
    title: config.blog.name,
    description: config.blog.metadata.description,
    site_url: baseUrl,
    feed_url: urlJoin(baseUrl, '/rss'),
    language: 'en',
    pubDate: new Date(),
  });

  allPosts.map((post) => {
    if (!post.date_created) return;

    feed.item({
      title: post.title,
      description: post.title || '',
      url: urlJoin(baseUrl, `/blog/${post.slug}`),
      guid: post.slug,
      date: post.date_created,
      author: post.author,
    });
  });

  const xml = feed.xml({ indent: true });

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
