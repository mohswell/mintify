import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared";
import { IconMenu, IconX } from "@/components/icons";
import { LogoFull } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared"; // Import ThemeToggle
import { usePathname } from "next/navigation"; // Import usePathname

const links = [
  { label: "The Stock Project", path: "https://www.stucruum.com" },
  { label: "Company", path: "https://www.photoruum.com" },
  { label: "Community", path: "https://www.stucruum.com/contributors" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); // Get current path

  // Check if the current page is dashboard or community
  const isDashboardOrCommunity = pathname.startsWith("/dashboard") || pathname.startsWith("/community");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "unset"; // Prevent scrolling when menu is open
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="w-full px-4 md:px-[3%] md:h-[88px] h-[72px] flex justify-center items-center">
        <div className="w-full max-w-screen-11xl mx-auto flex justify-between items-center">
          <LogoFull />
          <div className="md:flex hidden justify-center items-center w-fit gap-x-12">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="font-normal text-base text-dark dark:text-white !leading-5"
              >
                {link.label}
              </Link>
            ))}
            <Button
              href="https://www.photoruum.com/join"
              target="_blank"
              rel="noopener noreferrer"
              className="!px-6"
            >
              Join us
            </Button>
          </div>
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <IconX className="h-auto w-6 shrink-0" />
            ) : (
              <IconMenu className="h-auto w-6 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed right-0 top-0 h-full w-full bg-white dark:bg-dark transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 h-[72px] flex justify-between items-center">
            <LogoFull />
            <button
              className="focus:outline-none"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <IconX className="h-auto w-6 shrink-0" />
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col mt-8 px-4 pt-8 space-y-12">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="font-normal text-2xl text-dark dark:text-white"
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}

            {/* Join Button */}
            <div className="pt-4 justify-start">
              <Button
                href="https://www.photoruum.com/join"
                target="_blank"
                rel="noopener noreferrer"
                className="!px-4 w-auto max-w-[300px]"
                onClick={toggleMenu}
              >
                Join community
              </Button>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-auto p-4 flex justify-between items-center">
            {/* Conditionally render ThemeToggle only for dashboard/community paths */}
            {isDashboardOrCommunity && (
              <div className="relative">
                <ThemeToggle /> {/* Display the Theme Toggle only on these paths */}
              </div>
            )}

            <span className={`text-sm text-gray-500 dark:text-gray-400 ${isDashboardOrCommunity ? "ml-auto" : "mx-auto"}`}>
              {new Date().getFullYear()} © PHOTORUUM FACILITY
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
