import "@/styles/globals.css";

import Sidebar from "../../components/views/ui/sidebar";
import Header from "../../components/views/ui/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col h-screen overflow-hidden"> {/* Ensure full height and hide overflow */}
        <Header />
        <div className="flex-1 overflow-y-auto"> {/* Allow only this section to scroll */}
          {children}
        </div>
      </div>
    </div>
  );
}
