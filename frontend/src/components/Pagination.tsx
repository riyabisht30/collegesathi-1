'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium
                   text-gray-700 dark:text-gray-300
                   disabled:opacity-40 disabled:cursor-not-allowed 
                   hover:border-primary-300 hover:text-primary-600 transition-colors"
      >
        ← Prev
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...' || page === currentPage}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary-600 text-white'
                : page === '...'
                ? 'cursor-default text-gray-400 dark:text-gray-500'
                : 'hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium
                   text-gray-700 dark:text-gray-300
                   disabled:opacity-40 disabled:cursor-not-allowed 
                   hover:border-primary-300 hover:text-primary-600 transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
