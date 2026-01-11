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
    basePath = '/page/',
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
    const getPageUrl = (pageNumber: number) => {
        if (pageNumber == 1) {
            return '/';
        }
        return `${basePath}${pageNumber}`;
    };

    return (
        <Pagination>
            <PaginationContent>
                {pagination.prevPage && (
                    <PaginationItem>
                        <PaginationPrevious href={getPageUrl(pagination.prevPage)} />
                    </PaginationItem>
                )}

                {/* Show page 1 after navigating far enough */}
                {pagination.page > numSiblingPages + 2 && (
                    <>
                        <PaginationItem>
                            <PaginationLink href={getPageUrl(1)}>1</PaginationLink>
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
                                href={getPageUrl(pageNumber)}
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
                            <PaginationLink href={getPageUrl(pagination.totalPages)}>
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
