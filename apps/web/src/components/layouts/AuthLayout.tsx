import { LayoutProps } from "@/types";
import Slides from "@/components/Slides";
import { AppLayout } from "@/components/layouts";

export function AuthLayout({ page, children }: LayoutProps) {
  return (
    <AppLayout page={page} className="!bg-white !text-dark">
      <div className="w-full flex-1 flex flex-col lg:flex-row lg:justify-center justify-start lg:items-center items-start">
        <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-12">
          <div className="w-full overflow-hidden relative bg-black/10 md:h-[412px] h-[312px]">
            <Slides />
          </div>

          <div className="flex flex-col items-start w-full justify-center lg:min-h-[412px]">
            {children}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
