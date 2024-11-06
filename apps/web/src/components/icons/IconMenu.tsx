import { SVGProps } from "@/types";

export function IconMenu(props: SVGProps) {
  return (
    <svg
      width="28"
      height="12"
      viewBox="0 0 28 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M26 2H2"
        strokeWidth="2.5"
        stroke="currentColor"
        strokeLinecap="square"
      />
      <path
        d="M26 10H2"
        strokeWidth="2.5"
        stroke="currentColor"
        strokeLinecap="square"
      />
    </svg>
  );
}
