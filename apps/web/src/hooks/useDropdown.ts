import { useState, useEffect, useRef } from "react";

interface OutputProps {
  ref: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDropdown(initial: boolean = false): OutputProps {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setDropdown] = useState<boolean>(initial);

  /**
   * Opens the dropdown.
   */
  const open = (): void => setDropdown(true);

  /**
   * Closes the dropdown.
   */
  const close = (): void => setDropdown(false);

  /**
   * Toggle the dropdown.
   */
  const toggle = (): void => setDropdown((prev: boolean) => !prev);

  /**
   * Handles the click event when clicking outside the dropdown.
   *
   * @param event - The click event.
   */
  const handleClickOutside = (event: MouseEvent): void => {
    // If the click event target is outside the dropdown, close the dropdown
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setDropdown(false);
    }
  };

  useEffect(() => {
    // Add event listener for click events outside the dropdown
    const handleClick = (event: MouseEvent): void => handleClickOutside(event);
    document.addEventListener("mousedown", handleClick);

    // Clean up the event listener when the component unmounts
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return { ref, isOpen, open, close, toggle };
}
