import {
  IconInfo,
  IconMinus,
  IconUser,
  IconChevronDown,
} from "@/components/icons";
import { Stats } from "@/types";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/auth";
import { useViewportSize } from "@mantine/hooks";
import { StatCard } from "@/components/dashboard";
import { Device, SESSION_NAME } from "@/lib/constants";
import { Dropdown, DropdownItem } from "@/components/shared";
import {
  useDropdown,
  useDisclosure,
  useElementSize,
  useGreeting,
} from "@/hooks";
import { useEffect, useState } from "react";
import { IconLoader } from "@tabler/icons-react";
import { getStats } from "@/actions";

export function Profile() {
  const greeting = useGreeting();
  const user = useAuthStore((state) => state.user);
  const [opened, { toggle }] = useDisclosure(true);
  const [error, setError] = useState<string>("");
  const [isPending, setPending] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats>({
    submissions: 0,
    art: 0,
    approved: 0,
    pending: 0,
    unapproved: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setError("");

      try {
        const { ok, data } = await getStats();

        if (!ok) {
          setPending(false);
          setError("Failed to fetch stats");
          return;
        }

        setStats(data as Stats);
      } catch (error: any) {
        console.error(error);
      } finally {
        setPending(false);
      }
    };

    fetchStats();
  }, []);

  const { ref, height } = useElementSize(stats);

  if (isPending) {
    return (
      <div className="w-full flex rounded-2xl flex-col justify-center items-center bg-white dark:bg-dark-darker gap-y-40 h-80 shrink-0">
        <div className="flex sm:hidden flex-col items-center text-center w-fit">
          <h2 className="font-medium text-[32px] leading-10 tracking-[-2%] text-dark dark:text-white">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-xl !leading-4 font-light tracking-[-2%] text-light-gray-7 dark:text-light-gray-6">
            {greeting}
          </p>
        </div>

        <IconLoader className="h-auto w-6 text-black dark:text-white animate-spin" />
      </div>
    );
  }

  if (error.trim()) {
    return (
      <div className="w-full flex rounded-2xl flex-col justify-center items-center bg-white dark:bg-dark-darker gap-y-40 h-80 shrink-0">
        <div className="flex sm:hidden flex-col items-center text-center w-fit">
          <h2 className="font-medium text-[32px] leading-10 tracking-[-2%] text-dark dark:text-white">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-xl !leading-4 font-light tracking-[-2%] text-light-gray-7 dark:text-light-gray-6">
            {greeting}
          </p>
        </div>

        <p className="flex justify-center items-center m-auto font-light text-center md:text-base text-sm !leading-4 tracking-[-2%] text-light-gray-7 dark:text-light-gray-6">
          {error}
        </p>
      </div>
    );
  }

  const statList: any[] = [
    { name: "Submissions", value: stats.submissions },
    { name: "Art", value: stats.art },
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Unapproved", value: stats.unapproved },
  ];

  const isEmpty = statList.every((stat) => stat.value === 0);

  return (
    <div
      className={`flex flex-col sm:p-6 p-4 h-fit sm:h-fit shrink-0 bg-white dark:bg-dark-darker transition-all duration-300
      ${opened ? "rounded-2xl" : "rounded-lg"}`}
    >
      <Header isDrawerOpen={opened} onClick={toggle} />

      <div
        style={{ height: opened ? height : 0 }}
        className="w-full overflow-hidden lg:transition-none transition-all flex-grow shrink-0 flex justify-center items-center duration-500 ease-in-out"
      >
        <div
          ref={ref}
          className={`w-full transition-all duration-200
          ${opened ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          {!isEmpty ? (
            <>
              <div className="flex flex-col items-center justify-center gap-y-8 pt-4">
                <div className="flex sm:h-14 h-fit">
                  <div className="flex sm:hidden flex-col items-center text-center w-fit">
                    <h2 className="font-medium text-[32px] leading-10 tracking-[-2%] text-dark dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-xl !leading-4 font-light tracking-[-2%] text-light-gray-7 dark:text-light-gray-6">
                      {greeting}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap sm:gap-5 gap-4 items-center justify-center pb-4">
                  {statList.map((stat) => (
                    <StatCard
                      key={stat.name}
                      name={stat.name}
                      value={stat.value}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <EmptyProfile />
          )}
        </div>
      </div>
    </div>
  );
}

interface HeaderProps {
  isDrawerOpen: boolean;
  onClick?: () => void;
}

function Header({ onClick, isDrawerOpen }: HeaderProps) {
  const router = useRouter();
  const greeting = useGreeting();
  const { width } = useViewportSize();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { ref, isOpen, toggle } = useDropdown();

  const isMobile = width <= Device.TABLET_SM;

  function handleLogout() {
    toggle();

    logout();
    Cookies.remove(SESSION_NAME);

    router.push("/login");
  }

  return (
    <div
      role={isMobile ? "button" : "none"}
      onClick={isMobile ? onClick : undefined}
      className="w-full flex sm:justify-between relative justify-center items-center h-8"
    >
      <h3
        className={`font-medium absolute left-0 text-lg sm:hidden flex items-center transition-all duration-300 !leading-[18px] tracking-[-2%]
        ${isDrawerOpen ? "opacity-0 invisible" : "opacity-100 visible"}`}
      >
        Content dash
      </h3>

      <h3 className="font-medium w-fit text-lg sm:flex items-center hidden !leading-[18px] tracking-[-2%]">
        <span className="mr-2 font-medium text-2xl !leading-6 tracking-[-2%]">
          {user?.first_name} {user?.last_name}
        </span>
        <span className="text-base font-light !leading-4 tracking-[-2%] text-light-gray-7 dark:text-light-gray-7">
          {greeting}
        </span>
      </h3>

      <div
        ref={ref}
        className={`relative transition-all flex justify-center items-center duration-300
        ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={toggle}
          className="flex justify-center items-center gap-x-1"
        >
          <IconUser className="h-auto w-6 shrink-0 text-dark dark:text-white stroke-2" />
          <IconChevronDown
            className={`h-auto w-6 shrink-0 transition-transform text-light-gray-6 dark:text-light-gray-6 duration-300 stroke-[1.5]
            ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </button>

        <Dropdown
          isOpen={isOpen}
          alignment={isMobile ? "center" : "left"}
          className="w-[185px] min-w-[185px] shrink-0 bg-white dark:bg-dark-background gap-y-[18px] border border-light-gray-2 dark:border-dark-background px-4 py-6 rounded-lg"
        >
          <DropdownItem onClick={toggle}>Change password</DropdownItem>
          <DropdownItem onClick={toggle}>Delete account</DropdownItem>
          <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
        </Dropdown>
      </div>

      <div className="absolute right-0 sm:hidden flex justify-center items-center">
        <div className="relative h-6 w-6 shrink-0 flex justify-center items-center">
          <IconChevronDown
            className={`h-auto w-6 shrink-0 absolute right-0 transition-all text-light-gray-6 dark:text-light-gray-7 duration-300 stroke-[1.5]
            ${isDrawerOpen ? "rotate-180 opacity-0" : "rotate-0 opacity-100"}`}
          />
          <IconMinus
            className={`h-auto w-6 shrink-0 absolute right-0 transition-all text-light-gray-6 dark:text-light-gray-7 duration-300 stroke-[1.5]
            ${isDrawerOpen ? "rotate-180 opacity-100" : "rotate-0 opacity-0"}`}
          />
        </div>
      </div>
    </div>
  );
}

const EmptyProfile = () => {
  const greeting = useGreeting();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="w-full flex flex-col justify-center items-center gap-y-40 pb-8 sm:py-56 lg:py-24 sm:h-52 shrink-0">
      <div className="flex sm:hidden flex-col items-center text-center w-fit">
        <h2 className="font-medium text-[32px] leading-10 tracking-[-2%] text-dark dark:text-white">
          {user?.first_name} {user?.last_name}
        </h2>
        <p className="text-xl !leading-4 font-light tracking-[-2%] text-light-gray-7 dark:text-light-gray-6">
          {greeting}
        </p>
      </div>

      <p className="flex justify-center items-center gap-x-2 m-auto font-light text-center md:text-base text-sm !leading-4 tracking-[-2%] text-light-gray-7 dark:text-light-gray-6 sm:p-0 px-8 py-4 rounded-lg sm:border-none sm:border-0 border border-light-gray-2 dark:border-dark">
        <IconInfo className="h-auto w-5 -mt-0.5 shrink-0" />
        Content data appears here
      </p>
    </div>
  );
};
