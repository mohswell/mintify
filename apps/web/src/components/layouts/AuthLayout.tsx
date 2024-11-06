import { LayoutProps } from "@/types";
import Slides from "@/components/Slides";
import { AppLayout } from "@/components/layouts";
import { ThemeProvider } from "next-themes";
import Providers from "@/components/Providers";

export function AuthLayout({ page, children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Providers>
        <AppLayout page={page} className="bg-white dark:bg-dark text-dark dark:text-white">
          <div className="w-full flex-1 flex flex-col lg:flex-row lg:justify-center justify-start lg:items-center items-start">
            <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-12">
              <div className="w-full overflow-hidden relative bg-light-gray-2 dark:bg-dark-2 md:h-[412px] h-[312px]">
                <Slides />
              </div>

              <div className="flex flex-col items-start w-full justify-center lg:min-h-[412px]">
                {children}
              </div>
            </div>
          </div>
        </AppLayout>
      </Providers>
    </ThemeProvider>
  );
}
