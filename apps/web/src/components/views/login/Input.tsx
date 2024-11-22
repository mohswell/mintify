import clsx from "clsx";
import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: React.ReactNode;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

export function Input(props: InputProps): JSX.Element {
  const { type, label, className, leftSection, rightSection, ...rest } = props;
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isTypePassword = type === "password";

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

      <div className="relative flex items-center justify-center w-full">
        {leftSection ? (
          <label
            htmlFor={rest.id}
            className="absolute left-0 z-[2] flex items-center justify-center h-full w-12"
          >
            {leftSection}
          </label>
        ) : null}

        {rightSection ? (
          <label
            htmlFor={rest.id}
            className="absolute right-0 z-[2] flex items-center justify-center h-full w-12"
          >
            {rightSection}
          </label>
        ) : isTypePassword ? (
          <button
            type="button"
            title={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prevState: boolean) => !prevState)}
            className="text-light-gray-7 md:hover:text-dark dark:md:hover:text-white duration-300 transition-all absolute right-0 z-[2] w-12 h-full flex justify-center items-center"
          >
            {showPassword ? (
              <IconEyeOff className="h-auto w-6 stroke-[1.5]" />
            ) : (
              <IconEye className="h-auto w-6 stroke-[1.5]" />
            )}
          </button>
        ) : null}

        <input
          type={showPassword ? "text" : type}
          autoComplete={rest.autoComplete || "off"}
          className={clsx(
            className,
            isTypePassword ? "pr-12" : "px-4",
            leftSection ? "pl-12" : "px-4",
            rightSection ? "pr-12" : "px-4",
            "border text-dark border-light-gray-6 bg-light-gray-1 placeholder-light-gray-6 dark:text-white dark:border-dark dark:bg-dark-background dark:placeholder-light-gray-7 focus:border-dark dark:focus:border-white rounded-lg h-12 text-base !leading-4 focus:placeholder-transparent dark:focus:placeholder-transparent font-light relative w-full z-[1] transition-all duration-300 ease-in-out disabled:border-light-gray-3 disabled:text-light-gray-7 disabled:bg-light-gray-2 dark:disabled:border-dark-background dark:disabled:text-light-gray-7 dark:disabled:bg-dark",
          )}
          {...rest}
        />
      </div>
    </fieldset>
  );
}
