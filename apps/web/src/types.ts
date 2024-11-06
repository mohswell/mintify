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
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number: string;
  is_admin: false;
  is_inactive: false;
  created_at: string;
}

export type Token = string | null;

export interface UserToken {
  token: string;
  user: User;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: number;
  image_url: string;
  upload_date: string;
  title: string;
  artruum_submission: boolean;
  status: SubmissionStatus;
  user_id: number;
  size: string;
}

export interface SubmissionFile {
  fileName: string;
  fileUrl: string;
  fileSize: string;
}

export interface Photo {
  id: string;
  image: File;
  url: string;
}


export interface PhotoIndicatorProps {
  image: Photo;
  isActive: boolean;
  onSelect: () => void;
}

import { ChangeEventHandler } from "react";
export interface PhotoViewProps {
  images: Photo[];
  activeImage: number;
  onRemove: (id: string) => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export interface ImageUploadResponse {
  message: string;
  files: SubmissionFile[];
}

export interface NewSubmission {
  artruum_submission: boolean;
  description?: string;
  tags: string[];
  files: SubmissionFile[];
}

export interface Stats {
  submissions: number;
  art: number;
  approved: number;
  pending: number;
  unapproved: number;
}

export interface ModalProps {
  opened: boolean;
  onClose: () => void;
}

export interface CommunityGalleryProps {
  images: { 
    image_url: string; 
    title: string; 
    description?: string;
    users: {  
        first_name: string; 
        last_name: string; 
      };
  }[];
}

export type CommunityImage = {
  image_url: string;
  title: string;
  description?: string;
  users: {
    first_name: string;
    last_name: string;
  };
};

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

export interface SubmissionsHeaderProps {
  opened: boolean;
  isMobile: boolean;
  filter: Option;
  toggle: () => void;
  onFilterChange: (value: Option) => void;
  filterOptions: Option[];
}

export interface SubmissionsListProps {
  submissions: Submission[];
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}