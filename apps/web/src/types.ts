import { assertValue } from "@/lib/helpers";

export interface LayoutProps {
  page: {
    title: string;
    description?: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export type SVGProps = React.ComponentPropsWithoutRef<"svg">;

export interface Option {
  label: string;
  value: string;
}

export interface ActionResponse {
  ok: boolean;
  data: any;
}

export interface LoginDetails {
  email: string;
  password: string;
}

export interface SignupDetails {
  firstName: string;
  lastName: string;
  username?: string | null;
  email: string;
  password: string;
}

export interface SignupInfo {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number?: string;
  is_admin?: false;
  is_inactive: false;
  created_at: string;
  updated_at: string;
  profile_image?: string;
}

export type Token = string | null;

export interface UserToken {
  token: string;
  user: User;
}

export type PullRequestStatus = "pending" | "approved" | "closed";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const API_URL = assertValue(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "Missing environment variable: NEXT_PUBLIC_API_BASE_URL",
);