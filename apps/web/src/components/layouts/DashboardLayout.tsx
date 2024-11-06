import { LayoutProps } from "@/types";
import { ThemeProvider } from "next-themes";
import Providers from "@/components/Providers";
import { AppLayout } from "@/components/layouts";

export function DashboardLayout({ page, children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Providers>
        <AppLayout page={page}>
          <div className="w-full px-4 md:px-[3%] flex-grow flex-1 flex">
            {children}
          </div>
        </AppLayout>
      </Providers>
    </ThemeProvider>
  );
}
