import { useState, useCallback } from "react";

interface UseDisclosureOutput {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDisclosure(
  initialState: boolean = false,
): [boolean, Omit<UseDisclosureOutput, "opened">] {
  const [opened, setOpened] = useState<boolean>(initialState);

  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(() => setOpened((prev) => !prev), []);

  return [
    opened,
    {
      open,
      close,
      toggle,
    },
  ];
}
