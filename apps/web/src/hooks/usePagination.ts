import { useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export function usePagination({ totalItems, itemsPerPage, currentPage }: UsePaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return { startIndex, endIndex: startIndex + itemsPerPage };
  }, [currentPage, itemsPerPage]);

  return {
    totalPages,
    pageNumbers,
    paginatedItems,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}