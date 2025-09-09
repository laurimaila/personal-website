import { BlogPostsPreview } from '@/components/BlogPostPreview';
import { BlogPostsPagination } from '@/components/BlogPostsPagination';
import { getPosts } from '@/lib/directus';

const Page = async (props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const searchParams = await props.searchParams;
    const page = searchParams.page ? parseInt(searchParams.page as string) : 1;

    const postsPerPage = 4;

    const allPosts = await getPosts();

    // Pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;

    const currentPosts = allPosts.slice(startIndex, endIndex);

    const pagination = {
        page: page,
        limit: postsPerPage,
        totalPages: totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
    };

    return (
        <div className="container mx-auto mb-10 px-5">
            <BlogPostsPreview posts={currentPosts} />
            <BlogPostsPagination pagination={pagination} basePath="/?page=" />
        </div>
    );
};

export default Page;
