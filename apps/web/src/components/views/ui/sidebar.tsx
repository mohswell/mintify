"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { LogoFull } from "./LogoFull";

import {
  Bell,
  Home,
  BarChart,
  GitCommit,
  GitPullRequest,
  ShoppingCart,
  User,
  Key
} from "lucide-react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

export const navItems = [
  {
    label: "Dashboard",
    href: "/home",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Pull Requests",
    href: "/home/code",
    icon: <GitPullRequest className="h-5 w-5" />,
  },
  {
    label: "Commits",
    href: "/home/usage",
    icon: <GitCommit className="h-5 w-5" />,
  },
  {
    label: "Access Token",
    href: "/home/access-tokens",
    icon: <Key className="h-5 w-5" />,
  },
  {
    label: "AI Usage",
    href: "/home/analytics",
    icon: <BarChart className="h-5 w-5" />,
  }
];

const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.25 12.15c-.4 1.05-1.44 1.83-2.75 1.83-1.31 0-2.35-.78-2.75-1.83H8.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5H10c.28 0 .5.22.5.5 0 .1-.03.19-.08.27.29.4.87.73 1.83.73.96 0 1.54-.33 1.83-.73-.05-.08-.08-.17-.08-.27 0-.28.22-.5.5-.5h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.75zm-4-6.3c1.31 0 2.35.78 2.75 1.83h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.5c-.28 0-.5-.22-.5-.5 0-.1.03-.19.08-.27-.29-.4-.87-.73-1.83-.73-.96 0-1.54.33-1.83.73.05.08.08.17.08.27 0 .28-.22.5-.5.5H8.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.75c.4-1.05 1.44-1.83 2.75-1.83z" fill="currentColor" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-3">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-5">
          <Link href="#" className="flex items-center justify-start">
            <AIIcon />
            <span className="font-kanit text-black dark:text-white text-[22px] font-medium leading-[10px] tracking-[-0.02em]">
              Bunjy AI
            </span>
          </Link>
          {/* <Button variant="link" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-5 w-5 " />
            <span className="sr-only">Toggle notifications</span>
          </Button> */}
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-3">
            {navItems.map((navItem) => (
              <Link
                key={navItem.label}
                href={navItem.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === navItem.href ? "bg-muted text-primary" : ""
                  }`}
              >
                {navItem.icon}
                <span className="text-lg">{navItem.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Link
            href="/home/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === "/home/profile" ? "bg-muted text-primary" : ""
              }`}
          >
            <User className="h-5 w-5" />
            <span className="text-lg">Profile</span>
          </Link>
        </div>
        {/* <div className="mt-auto p-4">
          <Card x-chunk="dashboard-02-chunk-0">
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </aside>
  );
}
