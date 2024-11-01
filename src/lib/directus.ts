import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

export interface BlogPost {
    readonly id: number;
    slug: string;
    title: string;
    banner?: string;
    content: string;
    date_created: string;
    date_updated?: string;
    author: string;
}

interface Schema {
    blog_posts: BlogPost[];
}

const directus = createDirectus<Schema>(process.env.NEXT_PUBLIC_DIRECTUS_URL as string).with(
    rest(),
);

export const getPosts = async (): Promise<BlogPost[]> => {
    const res = await directus.request(readItems('blog_posts'));
    return res;
};

export const getPostById = async (id: string): Promise<BlogPost> => {
    const res = await directus.request(readItem('blog_posts', id));
    return res;
};

export const getPostBySlug = async (slug: string): Promise<BlogPost> => {
    const res = await directus.request(
        readItems('blog_posts', {
            filter: {
                slug: {
                    _eq: slug,
                },
            },
        }),
    );
    return res[0];
};

export default directus;
