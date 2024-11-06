import { RootLayout } from ".";
import { LayoutProps } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function AppLayout({ page, children, className }: LayoutProps) {
  return (
    <RootLayout page={page} className={className}>
      <Navbar />
      <div className="w-full flex flex-col flex-1">{children}</div>
      <Footer />
    </RootLayout>
  );
}
