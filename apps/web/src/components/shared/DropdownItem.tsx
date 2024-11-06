import clsx from "clsx";
import Link from "next/link";

interface DropdownItemProps {
  href?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function DropdownItem(props: DropdownItemProps) {
  const className = clsx(
    props.className,
    "w-full text-left text-base !leading-4 font-light transition-all duration-300 tracking-[-2%] text-light-gray-7 hover:text-dark dark:text-light-gray-6 dark:hover:text-white",
  );

  return props?.href ? (
    <Link href={props.href} className={className} onClick={props.onClick}>
      {props.children}
    </Link>
  ) : (
    <div role="button" className={className} onClick={props.onClick}>
      {props.children}
    </div>
  );
}
