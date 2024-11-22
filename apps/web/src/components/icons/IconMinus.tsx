import { SVGProps } from "@/types";

export function IconMinus(props: SVGProps) {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 12H19"
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
