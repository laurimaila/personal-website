import { BlogPostsPreview } from '@/components/BlogPostPreview';
import { BlogPostsPagination } from '@/components/BlogPostsPagination';
import { Badge } from '@/components/ui/badge';
import { CircleX } from 'lucide-react';
import Link from 'next/link';

interface Params {
    slug: string;
}

export async function generateMetadata(props: { params: Promise<Params> }) {
    const params = await props.params;

    const { slug } = params;

    return {
        title: `#${slug}`,
        description: `Posts tagged with #${slug}`,
    };
}

const Page = async (props: {
    params: Promise<Params>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const { slug } = params;

    const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
    const result: any = [];
    return (
        <div className="container mx-auto px-5 mb-10">
            <Link href="/">
                <Badge className="px-2 py-1">
                    <CircleX className="inline-block w-4 h-4 mr-2" />
                    Posts tagged with <strong className="mx-2">#{slug}</strong>{' '}
                </Badge>
            </Link>
            <BlogPostsPreview posts={result} />
            <BlogPostsPagination pagination={result} basePath={`/tag/${slug}/?page=`} />
        </div>
    );
};

export default Page;
