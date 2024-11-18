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
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    isAdmin: false;
    phoneNumber: string;
    isInactive: boolean;
}

export interface Image {
    id: number;
    imageUrl: string;
    userId: number;
    user: {
        firstName: string;
        lastName: string;
    };
    artruumSubmission: boolean;
    status: string;
    title: string;
    size: string;
    uploadDate: string;
}

export type Token = string | null;

export interface UserToken {
    token: string;
    user: User;
}

export interface UsersData {
    items: User[];
    totalPages: number;
}


export interface FetchUsersResponse {
    ok: boolean;
    data: {
        message: string;
        ruumers: User[];
    };
}

export interface FetchImageResponse {
    ok: boolean;
    data: {
        message: string;
        images: Image[];
    };
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

export const API_URL = assertValue(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "Missing environment variable: NEXT_PUBLIC_API_BASE_URL",
);