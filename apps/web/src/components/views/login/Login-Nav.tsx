"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import { LogoFull } from "@/components/views/ui/LogoFull";

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4">
        <div className="container mx-auto flex justify-between items-center w-full">
          {/* Logo for both mobile and desktop */}
          <Link href="/" className="flex items-left justify-start">
            <LogoFull />
          </Link>

          {/* Admin Access text: Centered on desktop, hidden on mobile */}
          <div className="hidden md:flex items-center justify-center flex-grow mr-48">
            <span className="font-kanit text-black dark:text-white text-[22px] font-medium leading-[10px] tracking-[-0.02em]">
              Admin Access
            </span>
          </div>
        </div>
      </nav>
      <hr className="border-t border-gray-300 mt-0 dark:bg-gray-500" />
    </>
  );
}