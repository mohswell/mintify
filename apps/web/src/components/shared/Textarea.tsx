import clsx from "clsx";

interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  label?: React.ReactNode;
}

export function Textarea(props: TextareaProps) {
  const { label, className, ...rest } = props;

  return (
    <fieldset
      disabled={rest.disabled}
      className="flex flex-col items-start justify-start w-full gap-y-3"
    >
      {label ? (
        <label
          htmlFor={rest.id}
          className="text-base !leading-4 tracking-[2%] font-normal w-fit text-black dark:text-white flex justify-start items-center gap-x-1"
        >
          {label}
        </label>
      ) : null}

      <textarea
        autoComplete={rest.autoComplete || "off"}
        className={clsx(
          className,
          "border text-dark p-4 border-light-gray-6 bg-light-gray-1 placeholder-light-gray-6 dark:text-white dark:border-dark dark:bg-dark-background dark:placeholder-light-gray-7 focus:border-dark dark:focus:border-white rounded-lg min-h-12 text-base !leading-4 font-light relative w-full z-[1] transition-all duration-300 ease-in-out disabled:border-light-gray-3 disabled:text-light-gray-7 disabled:bg-light-gray-2 dark:disabled:border-dark-background dark:disabled:text-light-gray-7 dark:disabled:bg-dark resize-none",
        )}
        {...rest}
      />
    </fieldset>
  );
}
