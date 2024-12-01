import type { Metadata } from "next";
import "../styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { Kanit as FontSans } from "next/font/google";

import { cn } from "../lib/utils";
import { ThemeProvider } from "../components/views/ui/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Providers from "../providers/Provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["200", "400", "500"],
});

export const metadata: Metadata = {
  title: "Bunjy AI",
  description: "AI application integrated to your github repository",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers> 
            <NuqsAdapter>{children}</NuqsAdapter>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
