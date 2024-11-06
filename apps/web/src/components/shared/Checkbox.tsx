import { IconCheck } from "@tabler/icons-react";

interface CheckboxProps {
  checked?: boolean;
  onCheck?: (value: boolean) => void;
  children?: React.ReactNode;
}

export function Checkbox(props: CheckboxProps) {
  return (
    <div
      role="button"
      onClick={() => (props.onCheck ? props.onCheck(!!props.checked) : {})}
      className="flex justify-start items-center gap-x-3 w-fit cursor-pointer"
    >
      <div
        className={`w-[18px] h-[18px] border rounded flex justify-center items-center relative transition-all duration-200
        ${
          props.checked
            ? "bg-dark text-white border-dark dark:bg-white dark:text-dark dark:border-white"
            : "bg-transparent text-transparent border-light-gray-6 dark:border-light-gray-7"
        }`}
      >
        <IconCheck className="w-4 h-4 shrink-0" />
      </div>

      <p className="text-brand-main-900 font-normal text-base">
        {props.children}
      </p>
    </div>
  );
}
