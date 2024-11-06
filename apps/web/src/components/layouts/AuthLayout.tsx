import { LayoutProps } from "@/types";
// import Slides from "@/components/Slides";
import { AppLayout } from "@/components/layouts";
import { ThemeProvider } from "next-themes";
import Providers from "@/components/Providers";

export function AuthLayout({ page, children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Providers>
        <AppLayout page={page} className="bg-white dark:bg-dark text-dark dark:text-white">
          <div className="w-full flex-1 flex flex-col lg:flex-row lg:justify-center justify-center lg:items-center items-center">
            <div className="grid lg:grid-cols-1 grid-cols-1 w-full gap-12">
              {/* Commenting out the Slides component */}
              {/* <div className="w-full overflow-hidden relative bg-light-gray-2 dark:bg-dark-2 md:h-[412px] h-[312px]">
                <Slides />
              </div> */}

              {/* Centering and enlarging the children */}
              <div className="flex flex-col items-center justify-center w-full lg:min-h-[500px]">
                <div className="flex flex-col items-center justify-center w-full max-w-md lg:max-w-xl p-8 lg:p-16">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </Providers>
    </ThemeProvider>
  );
}
