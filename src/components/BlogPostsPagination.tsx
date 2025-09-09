import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export const BlogPostsPagination = ({
    pagination,
    basePath = '/?page=',
    numSiblingPages = 2,
}: {
    basePath?: string;
    numSiblingPages?: number;
    pagination: {
        page: number;
        limit: number | 'all';
        totalPages: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}) => {
    const isSinglePage = pagination.totalPages < 2;

    return (
        <Pagination>
            <PaginationContent>
                {pagination.prevPage && (
                    <PaginationItem>
                        <PaginationPrevious href={`${basePath}${pagination.prevPage}`} />
                    </PaginationItem>
                )}

                {/* Show page 1 after navigating far enough */}
                {pagination.page > numSiblingPages + 2 && (
                    <>
                        <PaginationItem>
                            <PaginationLink href={`${basePath}1`}>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    </>
                )}

                {/* Show pages around current page */}
                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
                    .filter(
                        (pageNumber) => Math.abs(pagination.page - pageNumber) <= numSiblingPages,
                    )
                    .map((pageNumber) => (
                        <PaginationItem key={pageNumber}>
                            <PaginationLink
                                href={`${basePath}${pageNumber}`}
                                isActive={pageNumber === pagination.page}>
                                {pageNumber}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                {/* Show last blog page */}
                {pagination.page < pagination.totalPages - numSiblingPages - 1 && (
                    <>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href={`${basePath}${pagination.totalPages}`}>
                                {pagination.totalPages}
                            </PaginationLink>
                        </PaginationItem>
                    </>
                )}

                {pagination.nextPage && (
                    <PaginationItem>
                        <PaginationNext href={`${basePath}${pagination.nextPage}`} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};
