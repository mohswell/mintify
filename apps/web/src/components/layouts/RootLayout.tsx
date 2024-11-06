import clsx from "clsx";
import Head from "next/head";
import { LayoutProps } from "@/types";
import { useTheme } from "next-themes";

export function RootLayout({ page, children, className }: LayoutProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={clsx(resolvedTheme, "w-full")} suppressHydrationWarning>
      <div
        className={clsx(
          className,
          "min-h-svh flex flex-col text-dark bg-light-gray-3 dark:text-white dark:bg-dark-background",
        )}
      >
        <Head>
          <title>{`${page.title} | STUCRUUM`}</title>
          <meta key="desc" name="description" content={page.description} />
          <meta property="og:description" content={page.description} />
          <meta property="og:title" content={`${page.title} | STUCRUUM`} />
        </Head>

        {children}
      </div>
    </div>
  );
}
