interface ToggleProps {
  active?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}

export function Toggle({ active = false, ...rest }: ToggleProps) {
  function handleToggle() {
    if (rest.onToggle) {
      rest.onToggle();
    }
  }

  return (
    <div
      role="button"
      onClick={handleToggle}
      className="flex justify-center items-center w-fit gap-x-2.5"
    >
      <div className="w-12 h-6 shrink-0 relative flex items-center cursor-pointer rounded-full overflow-hidden transition-all duration-300 bg-white dark:bg-black">
        <div
          className={`w-4 h-4 rounded-full shrink-0 transition-all duration-300 flex items-center justify-center bg-black dark:bg-white ${active ? "translate-x-[28px]" : "translate-x-1"}`}
        ></div>
      </div>

      {rest.children && (
        <p className="text-base font-normal text-brand-main-900">
          {rest.children}
        </p>
      )}
    </div>
  );
}
