import { IconChevronDown, IconMinus } from "@/components/icons";
import { Filter } from "@/components/shared";
// import { Option } from "@/types";
import { SubmissionsHeaderProps } from "@/types";

export function SubmissionsHeader({
  opened,
  isMobile,
  filter,
  toggle,
  onFilterChange,
  filterOptions
}: SubmissionsHeaderProps) {
  return (
    <div
      role={isMobile ? "button" : "none"}
      onClick={isMobile ? toggle : undefined}
      className="w-full flex justify-between items-center gap-x-5 h-8"
    >
      <h3 className="font-medium text-lg flex items-center !leading-[18px] tracking-[-2%]">
        Your submissions
      </h3>

      <div className="relative flex justify-center items-center gap-x-3">
        <div
          className={`w-fit transition-all duration-200
          ${opened ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          <Filter
            value={filter}
            options={filterOptions}
            placeholder="Filter by"
            setValue={onFilterChange}
          />
        </div>

        <div className="relative sm:hidden h-6 w-6 shrink-0 flex justify-center items-center">
          <IconChevronDown
            className={`h-auto w-6 shrink-0 absolute right-0 transition-all text-light-gray-6 dark:text-light-gray-7 duration-300 stroke-[1.5]
            ${opened ? "rotate-180 opacity-0" : "rotate-0 opacity-100"}`}
          />
          <IconMinus
            className={`h-auto w-6 shrink-0 absolute right-0 transition-all text-light-gray-6 dark:text-light-gray-7 duration-300 stroke-[1.5]
            ${opened ? "rotate-180 opacity-100" : "rotate-0 opacity-0"}`}
          />
        </div>
      </div>
    </div>
  );
}