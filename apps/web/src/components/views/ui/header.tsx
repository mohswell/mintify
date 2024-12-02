"use client";

import React from "react";
import MobileNav from "./mobile-nav";
import { Bell, CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { ModeToggle } from "./mode-toggle";
import { useGreeting } from "@/hooks";
import { useAuthStore } from "@/stores/auth";
import { SESSION_NAME } from "@/lib/constants";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";

export default function Header() {
  const [user, setUser] = React.useState<string>("");
  const [theme, setTheme] = React.useState<string>("light"); // Keep track of the theme
  const greeting = useGreeting(theme === "dark");
  const profileImage = useAuthStore.getState().user?.avatarUrl;
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  React.useEffect(() => {
    const currentUser = useAuthStore.getState().user?.firstName || "Dev";
    setUser(currentUser);
  }, []);

  function handleLogout() {
    logout();
    Cookies.remove(SESSION_NAME);
    router.push("/");
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <MobileNav />
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <div className="relative">
              <div className="text-lg font-semibold md:text-base dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
                {user && `${user}`}
                {greeting && `, ${greeting}`}
              </div>
            </div>
          </div>
        </form>
      </div>
      <Button variant="link" size="icon" className="ml-auto h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <ModeToggle onThemeChange={setTheme} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link" size="icon" className="rounded-full">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="User Avatar"
                className="h-8 w-8 rounded-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <CircleUser className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

