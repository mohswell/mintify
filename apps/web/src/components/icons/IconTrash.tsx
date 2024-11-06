import { SVGProps } from "@/types";

export function IconTrash(props: SVGProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        strokeWidth="2"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
        d="M8 10.6667H9.77778H24"
      />
      <path
        strokeWidth="2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22.6663 11.7334V23.4667C22.6663 23.9618 22.4657 24.4366 22.1084 24.7867C21.7512 25.1367 21.2668 25.3334 20.7616 25.3334H11.2378C10.7326 25.3334 10.2481 25.1367 9.8909 24.7867C9.53369 24.4366 9.33301 23.9618 9.33301 23.4667V11.7334M12.1902 10.4001V8.53341C12.1902 8.03834 12.3908 7.56355 12.748 7.21348C13.1053 6.86341 13.5897 6.66675 14.0949 6.66675H17.9044C18.4096 6.66675 18.8941 6.86341 19.2513 7.21348C19.6085 7.56355 19.8092 8.03834 19.8092 8.53341V10.4001"
      />
    </svg>
  );
}
