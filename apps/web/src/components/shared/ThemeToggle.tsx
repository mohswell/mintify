import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/shared/Toggle";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    // eslint-disable-next-line
  }, []);

  if (!mounted) {
    return;
  }

  return (
    <Toggle
      active={resolvedTheme === "dark"}
      onToggle={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    />
  );
}
