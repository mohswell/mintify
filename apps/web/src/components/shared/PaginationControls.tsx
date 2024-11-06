import { 
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight 
} from "@tabler/icons-react";
import { PaginationControlsProps } from "@/types";
  
export function PaginationControls({
    currentPage,
    totalPages,
    pageNumbers,
    onPageChange,
    onFirstPage,
    onLastPage,
    onPreviousPage,
    onNextPage,
}: PaginationControlsProps) {
if (totalPages <= 1) return null;
  
    return (
      <div className="w-full bg-white dark:bg-dark-darker pt-2 flex justify-between items-center mt-0 sticky text-black dark:text-white bottom-0">
        <div className="flex justify-center items-center gap-x-2">
          <button 
            className="disabled:text-light-gray-6 p-1" 
            onClick={onFirstPage}
            disabled={currentPage === 1}
          >
            <IconChevronsLeft className="h-auto w-6 shrink-0" />
          </button>
          <button 
            className="disabled:text-light-gray-6 p-1"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
          >
            <IconChevronLeft className="h-auto w-6 shrink-0" />
          </button>
        </div>
  
        <div className="flex justify-center items-center gap-x-3 w-fit">
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`text-base !leading-4 h-6 w-7 transition-all duration-200 rounded flex justify-center items-center
              ${
                currentPage === pageNum
                  ? "text-white bg-black dark:text-black dark:bg-white font-medium"
                  : "text-black dark:text-white font-light"
              }`}
            >
              {pageNum < 10 ? pageNum.toString().padStart(1, "0") : pageNum}
            </button>
          ))}
        </div>
  
        <div className="flex justify-center items-center gap-x-2">
          <button 
            className="disabled:text-light-gray-6 p-1"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            <IconChevronRight className="h-auto w-6 shrink-0" />
          </button>
          <button 
            className="disabled:text-light-gray-6 p-1"
            onClick={onLastPage}
            disabled={currentPage === totalPages}
          >
            <IconChevronsRight className="h-auto w-6 shrink-0" />
          </button>
        </div>
      </div>
    );
}