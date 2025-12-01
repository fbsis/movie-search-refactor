import { Button } from "./ui/button";

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const maxVisiblePages = 5;
  const halfVisible = Math.floor(maxVisiblePages / 2);

  // Calculate start and end pages for visible range
  // Ensure we show maxVisiblePages pages when possible, centered around currentPage
  let startPage = Math.max(1, currentPage - halfVisible);
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start page if we're near the end and can show more pages
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  // Helper function to render page button
  const renderPageButton = (page: number, isActive: boolean) => (
    <Button
      variant={isActive ? "default" : "secondary"}
      onClick={() => onPageChange(page)}
      className={isActive ? "bg-gradient-primary" : ""}
    >
      {page}
    </Button>
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Render first page and ellipsis if needed */}
      {startPage > 1 && (
        <>
          {renderPageButton(1, currentPage === 1)}
          {startPage > 2 && (
            <span className="text-muted-foreground px-2">...</span>
          )}
        </>
      )}

      {/* Render visible page numbers */}
      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "secondary"}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? "bg-gradient-primary" : ""}
        >
          {page}
        </Button>
      ))}

      {/* Render last page and ellipsis if needed */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="text-muted-foreground px-2">...</span>
          )}
          {renderPageButton(totalPages, currentPage === totalPages)}
        </>
      )}

      <Button
        variant="secondary"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;

