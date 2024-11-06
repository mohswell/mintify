import { Device, SUBMISSION_FILTERS, ITEMS_PER_PAGE } from "@/lib/constants";
import { useEffect, useState, useMemo } from "react";
import { Option, Submission } from "@/types";
import { useViewportSize } from "@mantine/hooks";
import { useDisclosure, useElementSize } from "@/hooks";
import { IconLoader } from "@tabler/icons-react";
import { getSubmissions } from "@/actions";
import { SubmissionsHeader } from "../views/submissions/SubmissionsHeader";
import { SubmissionsList } from "../views/submissions/SubmissionsList";
import { EmptySubmissions } from "../views/submissions/EmptySubmissions";
import { usePagination } from "@/hooks/usePagination";

export function Submissions() {
  const { width } = useViewportSize();
  const { ref, height } = useElementSize();
  const [opened, { toggle }] = useDisclosure(true);

  const [filter, setFilter] = useState<Option>({ label: "All", value: "all" });
  const [error, setError] = useState<string>("");
  const [isPending, setPending] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const isMobile = width <= Device.TABLET_SM;

  // Filter submissions based on status or art
  const filteredSubmissions = useMemo(() => {
    const filterFunctions = {
      all: () => submissions,
      art: () => submissions.filter((s) => s.artruum_submission),
      default: () => submissions.filter((s) => s.status.toLowerCase() === filter.value)
    };
  
    return (filterFunctions[filter.value as keyof typeof filterFunctions] || filterFunctions.default)();
  }, [submissions, filter.value]);

  // Pagination logic
  const {
    totalPages,
    pageNumbers,
    paginatedItems
    // isFirstPage,
    // isLastPage
  } = usePagination({
    totalItems: filteredSubmissions.length,
    itemsPerPage: ITEMS_PER_PAGE,
    currentPage,
  });

  const paginatedSubmissions = useMemo(() => {
    const { startIndex, endIndex } = paginatedItems;
    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, paginatedItems]);

  // Navigation handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    const fetchStats = async () => {
      setError("");
      try {
        const { ok, data } = await getSubmissions();
        if (!ok) {
          setPending(false);
          setError("Failed to fetch submissions");
          return;
        }
        setSubmissions(data.images as Submission[]);
      } catch (error: any) {
        console.error(error);
        setError("An error occurred while fetching submissions");
      } finally {
        setPending(false);
      }
    };

    fetchStats();
  }, []);

  if (isPending) {
    return (
      <div className="w-full flex-1 flex rounded-2xl sm:mt-0 mt-8 justify-center items-center py-28 lg:py-0 bg-white dark:bg-dark-darker">
        <IconLoader className="h-auto w-6 text-black dark:text-white animate-spin" />
      </div>
    );
  }

  if (error.trim()) {
    return (
      <div className="w-full flex-1 flex rounded-2xl sm:mt-0 mt-8 justify-center items-center py-28 lg:py-0 bg-white dark:bg-dark-darker">
        <p className="flex justify-center items-center gap-x-2 font-light text-center md:text-base text-sm !leading-4 tracking-[-2%] text-light-gray-7 dark:text-light-gray-6 sm:p-0 px-8 py-4 rounded-lg sm:border-none sm:border-0 border border-light-gray-2 dark:border-dark">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col flex-1 sm:p-6 p-4 h-fit sm:h-full bg-white dark:bg-dark-darker transition-all duration-300
      ${opened ? "rounded-2xl sm:mt-0 mt-8" : "rounded-lg mt-4"}`}
    >
      <SubmissionsHeader
        opened={opened}
        isMobile={isMobile}
        filter={filter}
        toggle={toggle}
        onFilterChange={setFilter}
        filterOptions={SUBMISSION_FILTERS}
      />

      <div
        style={{ height: opened ? height : 0 }}
        className="w-full overflow-hidden transition-all flex-grow flex justify-center items-center duration-500 ease-in-out"
      >
        <div
          ref={ref}
          className={`w-full transition-all duration-200 flex sm:h-full
          ${opened ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          {filteredSubmissions.length > 0 ? ( 
            <SubmissionsList
              submissions={paginatedSubmissions}
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={setCurrentPage}
              onFirstPage={goToFirstPage}
              onLastPage={goToLastPage}
              onPreviousPage={goToPreviousPage}
              onNextPage={goToNextPage}
            />
          ) : (
            <EmptySubmissions />
          )}
        </div>
      </div>
    </div>
  );
}