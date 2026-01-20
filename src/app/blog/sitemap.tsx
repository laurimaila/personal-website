import { config } from '@/config';
import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/directus';
import urlJoin from 'url-join';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    {
      url: urlJoin(config.baseUrl, 'blog'),
      lastModified: new Date(),
      priority: 0.8,
    },
    ...posts.map((post) => {
      return {
        url: urlJoin(config.baseUrl, 'blog', post.slug),
        lastModified: new Date(post.date_updated ? post.date_updated : post.date_created),
        priority: 0.8,
      };
    }),
  ];
}
