import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BlogPostNavigation = ({
  prevPost,
  nextPost,
}: {
  prevPost: any | null;
  nextPost: any | null;
}) => {
  // Don't render if no previous or next post
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <div className="flex items-center justify-center gap-5">
        {/* Previous/Newer  */}
        <div className="max-w-sm flex-1">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              rel="prev"
              className="group flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700">
              <ChevronLeft className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              <div className="text-left">
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Newer Post</p>
                <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {prevPost.title}
                </h3>
              </div>
            </Link>
          ) : (
            <div className="p-4"></div>
          )}
        </div>

        {/* Next/Older */}
        <div className="max-w-sm flex-1">
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              rel="next"
              className="group flex items-center justify-end gap-3 rounded-lg border border-gray-200 p-4 text-right transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700">
              <div className="text-right">
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Older Post</p>
                <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {nextPost.title}
                </h3>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            </Link>
          ) : (
            <div className="p-4"></div>
          )}
        </div>
      </div>
    </nav>
  );
};
