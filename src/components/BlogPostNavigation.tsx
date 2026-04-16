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
    <nav className="border-border mt-12 border-t pt-8">
      <div className="flex items-center justify-center gap-5">
        {/* Previous/Newer  */}
        <div className="max-w-sm flex-1">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              rel="prev"
              className="group border-border hover:border-muted-foreground flex items-center gap-3 rounded-lg border p-4 transition-colors">
              <ChevronLeft className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
              <div className="text-left">
                <p className="text-muted-foreground mb-1 text-sm">Newer Post</p>
                <h3 className="text-foreground group-hover:text-primary line-clamp-2 font-medium transition-colors">
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
              className="group border-border hover:border-muted-foreground flex items-center justify-end gap-3 rounded-lg border p-4 text-right transition-colors">
              <div className="text-right">
                <p className="text-muted-foreground mb-1 text-sm">Older Post</p>
                <h3 className="text-foreground group-hover:text-primary line-clamp-2 font-medium transition-colors">
                  {nextPost.title}
                </h3>
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
            </Link>
          ) : (
            <div className="p-4"></div>
          )}
        </div>
      </div>
    </nav>
  );
};
