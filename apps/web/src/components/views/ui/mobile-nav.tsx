"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Package2 } from "lucide-react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { navItems } from "./sidebar";
import { LogoFull } from "./LogoFull";

const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.25 12.15c-.4 1.05-1.44 1.83-2.75 1.83-1.31 0-2.35-.78-2.75-1.83H8.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5H10c.28 0 .5.22.5.5 0 .1-.03.19-.08.27.29.4.87.73 1.83.73.96 0 1.54-.33 1.83-.73-.05-.08-.08-.17-.08-.27 0-.28.22-.5.5-.5h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.75zm-4-6.3c1.31 0 2.35.78 2.75 1.83h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.5c-.28 0-.5-.22-.5-.5 0-.1.03-.19.08-.27-.29-.4-.87-.73-1.83-.73-.96 0-1.54.33-1.83.73.05.08.08.17.08.27 0 .28-.22.5-.5.5H8.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.75c.4-1.05 1.44-1.83 2.75-1.83z" fill="currentColor" />
  </svg>
);

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link href="#" className="flex items-center justify-start">
            <AIIcon />
            <span className="font-kanit text-black dark:text-white text-[22px] font-medium leading-[10px] tracking-[-0.02em]">
              Bunjy AI
            </span>
          </Link>
          {navItems.map((navItem) => (
            <Link
              key={navItem.label}
              href={navItem.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === navItem.href ? "bg-muted text-primary" : ""
                }`}
            >
              {navItem.icon}
              {navItem.label}
            </Link>
          ))}
        </nav>
        {/* <div className="mt-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div> */}
      </SheetContent>
    </Sheet>
  );
}
