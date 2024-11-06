interface DropdownProps {
  isOpen?: boolean;
  position?: "top" | "bottom";
  alignment?: "left" | "right" | "center";
  children?: React.ReactNode;
  className?: string;
}

export function Dropdown(props: DropdownProps) {
  const { position = "bottom", alignment = "left", ...rest } = props;

  return (
    <div
      className={`max-w-max min-w-max w-fit absolute grid grid-cols-1 transition-all duration-300 ease-in-out z-30
      ${position === "top" ? "bottom-[120%]" : ""}
      ${position === "bottom" ? "top-[120%]" : ""}
      ${alignment === "left" ? "right-0" : ""}
      ${alignment === "right" ? "left-0" : ""}
      ${rest.isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
      ${rest.className}`}
    >
      {rest.children}
    </div>
  );
}
