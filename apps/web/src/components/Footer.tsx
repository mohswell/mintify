import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared";

export default function Footer() {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/community");

  return (
    <div className={`w-full px-4 md:px-[3%] md:py-6 py-4 flex justify-center items-center ${!isDashboard ? 'mt-24 md:mt-0' : ''}`}>
      <div className="w-full max-w-screen-11xl mx-auto flex md:justify-center justify-between items-center relative">
        {isDashboard && (
          <div className="md:absolute relative md:left-0">
            <ThemeToggle />
          </div>
        )}

        <span className="font-light md:text-sm text-xs !leading-[14px] tracking-[-2%] text-center">
          {new Date().getFullYear()} © PHOTORUUM FACILITY
        </span>
      </div>
    </div>
  );
}
