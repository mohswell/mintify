import { SubmissionCard } from "@/components/dashboard";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { SubmissionsListProps } from "@/types";

export function SubmissionsList({
  submissions,
  currentPage,
  totalPages,
  pageNumbers,
  onPageChange,
  onFirstPage,
  onLastPage,
  onPreviousPage,
  onNextPage,
}: SubmissionsListProps) {
  return (
    <div className="flex flex-col items-center overflow-y-auto no-scrollbar w-full relative h-full flex-1 justify-between gap-y-8 pt-4">
      <div className="w-full grid grid-cols-1">
        {submissions.map((submission, index) => (
          <SubmissionCard key={index} submission={submission} />
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={onPageChange}
        onFirstPage={onFirstPage}
        onLastPage={onLastPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  );
}