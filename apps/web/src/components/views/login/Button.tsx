import clsx from "clsx";
import Link from "next/link";
import { IconLoader } from "@tabler/icons-react";

type Variant = "default" | "unstyled";

type ButtonProps = {
  href?: string;
  loading?: boolean;
  variant?: Variant;
  className?: string;
} & React.ComponentPropsWithoutRef<"button"> &
  React.ComponentPropsWithoutRef<"a" | typeof Link>;

const variants: Record<Variant, string> = {
  default:
    "text-white bg-black dark:text-black dark:bg-white disabled:bg-opacity-50 dark:disabled:bg-opacity-50",
  unstyled: "",
};

export function Button(props: ButtonProps): JSX.Element {
  const { variant = "default", className, loading, ...rest } = props;

  const classNames = clsx(
    className,
    "relative flex justify-center items-center gap-x-2 px-8 py-3 text-base !leading-4 tracking-[-2.5%] font-normal rounded-lg transition-all disabled:cursor-not-allowed min-h-12",
    loading &&
      "!text-black/0 disabled:!text-black/0 dark:!text-white/0 dark:disabled:!text-white/0",
    variants[variant],
  );

  return props?.href ? (
    <Link
      href={props.href}
      className={classNames}
      {...(rest as React.ComponentPropsWithRef<"a" | typeof Link>)}
    >
      {props.children}
    </Link>
  ) : (
    <button
      className={classNames}
      disabled={props.disabled || loading}
      {...(rest as React.ComponentPropsWithRef<"button">)}
    >
      {loading && (
        <IconLoader className="absolute w-[18px] h-auto text-white dark:text-black stroke-[2.7] animate-spin shrink-0" />
      )}
      {props.children}
    </button>
  );
}
