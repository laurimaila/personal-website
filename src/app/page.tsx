import { BlogPostsPreview } from '@/components/BlogPostPreview';
import { BlogPostsPagination } from '@/components/BlogPostsPagination';
import { getPosts } from '@/lib/directus';

export const revalidate = 120;

const Page = async () => {
    // Start at page 1 on site load
    const page = 1;
    const postsPerPage = 4;

    const allPosts = await getPosts();

    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    const startIndex = 0;
    const endIndex = postsPerPage;

    const currentPosts = allPosts.slice(startIndex, endIndex);

    const pagination = {
        page: page,
        limit: postsPerPage,
        totalPages: totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: null,
    };

    return (
        <div className="container mx-auto mb-10 px-5">
            <BlogPostsPreview posts={currentPosts} />
            <BlogPostsPagination pagination={pagination} basePath="/page/" />
        </div>
    );
};

export default Page;
