import { IconInfo } from "@/components/icons";

export function EmptySubmissions() {
  return (
    <div className="w-full flex-1 flex justify-center items-center py-28 lg:py-0">
      <p className="flex justify-center items-center gap-x-2 font-light text-center md:text-base text-sm !leading-4 tracking-[-2%] text-light-gray-7 dark:text-light-gray-6 sm:p-0 px-8 py-4 rounded-lg sm:border-none sm:border-0 border border-light-gray-2 dark:border-dark">
        <IconInfo className="h-auto w-5 -mt-0.5 shrink-0" />
        All submissions will appear here
      </p>
    </div>
  );
}