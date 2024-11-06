import { Option } from "@/types";
import { useDropdown } from "@/hooks";
import { IconChevronDown, IconX } from "@tabler/icons-react";
import { Dropdown, DropdownItem } from "@/components/shared";

interface FilterProps {
  value?: Option;
  setValue?: (option: Option) => void;
  placeholder?: string;
  position?: "top" | "bottom";
  alignment?: "left" | "right";
  options?: Option[];
  disabled?: boolean;
  children?: React.ReactNode;
  onClear?: () => void;
}

export function Filter(props: FilterProps) {
  const { ref, isOpen, toggle } = useDropdown();

  function handleOnClear(event: any) {
    event.stopPropagation();

    if (props.onClear) {
      props.onClear();
    }
  }

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center w-fit h-fit"
    >
      <button
        onClick={toggle}
        className={`flex justify-center items-center gap-x-2 text-base font-light disabled:bg-brand-weak-100 disabled:cursor-not-allowed
        ${props.disabled ? "text-light-gray-6 dark:text-light-gray-7" : props.value?.label ? "text-dark dark:text-white" : "text-light-gray-7 dark:text-light-gray-6"}`}
        disabled={props.disabled}
      >
        {props.value?.label || props.placeholder}{" "}
        {props.value?.label && props.onClear ? (
          <span onClick={handleOnClear}>
            <IconX className="w-4 h-auto shrink-0 stroke-2 text-rose-600 transition-colors duration-300" />
          </span>
        ) : (
          <IconChevronDown className="w-5 h-auto shrink-0 stroke-2" />
        )}
      </button>

      <Dropdown
        isOpen={isOpen}
        className="w-[185px] min-w-[185px] shrink-0 bg-white dark:bg-dark-background gap-y-[18px] border border-light-gray-2 dark:border-dark-background px-4 py-6 rounded-lg"
      >
        {props.options
          ? props.options.map((option: Option) => (
              <DropdownItem
                key={option.label}
                onClick={() => {
                  if (props?.setValue) {
                    props.setValue(option);
                  }
                  toggle();
                }}
              >
                {option.label}
              </DropdownItem>
            ))
          : props.children}
      </Dropdown>
    </div>
  );
}
