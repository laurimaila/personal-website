import { BlogPostsPreview } from '@/components/BlogPostPreview';
import { BlogPostsPagination } from '@/components/BlogPostsPagination';
import { getPosts } from '@/lib/directus';
import { notFound } from 'next/navigation';

export const revalidate = 120;

export async function generateStaticParams() {
  const allPosts = await getPosts();
  const postsPerPage = 4;
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}

const Page = async (props: { params: Promise<{ page: string }> }) => {
  const params = await props.params;
  const page = parseInt(params.page);

  const postsPerPage = 4;
  const allPosts = await getPosts();

  // Pagination
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // 404 if page number is out of range
  if (page < 1 || page > totalPages) {
    notFound();
  }

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
