import { BlogPostsPreview } from '@/components/BlogPostPreview';
import { getPosts } from '@/lib/directus';

const Page = async (props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const searchParams = await props.searchParams;
    const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
    const result = await getPosts();

    return (
        <div className="container mx-auto px-5 mb-10">
            <BlogPostsPreview posts={result} />
        </div>
    );
};

export default Page;
