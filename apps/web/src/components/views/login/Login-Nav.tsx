"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import { LogoFull } from "@/components/views/ui/LogoFull";

const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.25 12.15c-.4 1.05-1.44 1.83-2.75 1.83-1.31 0-2.35-.78-2.75-1.83H8.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5H10c.28 0 .5.22.5.5 0 .1-.03.19-.08.27.29.4.87.73 1.83.73.96 0 1.54-.33 1.83-.73-.05-.08-.08-.17-.08-.27 0-.28.22-.5.5-.5h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.75zm-4-6.3c1.31 0 2.35.78 2.75 1.83h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.5c-.28 0-.5-.22-.5-.5 0-.1.03-.19.08-.27-.29-.4-.87-.73-1.83-.73-.96 0-1.54.33-1.83.73.05.08.08.17.08.27 0 .28-.22.5-.5.5H8.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.75c.4-1.05 1.44-1.83 2.75-1.83z" fill="currentColor" />
  </svg>
);

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3.5">
        <div className="container mx-auto flex justify-between items-center w-full">
          {/* Logo for both mobile and desktop */}
          <Link href="/" className="flex items-center justify-start">
            <AIIcon />
            <span className="font-kanit text-black dark:text-white text-[22px] font-medium leading-[10px] tracking-[-0.02em]">
              Bunjy AI
            </span>
          </Link>

          {/* Admin Access text: Centered on desktop, hidden on mobile */}
          <div className="hidden md:flex items-center justify-center flex-grow mr-48">
            <span className="font-kanit text-black dark:text-white text-[22px] font-medium leading-[10px] tracking-[-0.02em]">
              {pathname === '/signup' ? 'Signup Here' : 'Login Here'}
            </span>
          </div>
        </div>
      </nav>
      <hr className="border-t border-gray-300 mt-0 dark:bg-gray-500" />
    </>
  );
}