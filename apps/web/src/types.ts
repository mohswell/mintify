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

export interface GitHubUser {
  id: number;
  githubId?: number;
  login: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl: string;
}

export interface GenAiTokenUsage {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
}

export interface GenAiResponse {
  text: string;
  tokenUsage: GenAiTokenUsage;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface FileAnalysis {
  id: string;
  prNumber: number;
  filePath: string;
  additions: number;
  deletions: number;
  rawDiff: string;
  fileType: string;
  pullRequest: {
    id: string;
    title: string;
    url: string;
    author: string;
    authorUsername?: string;
    authorAvatar?: string;
    createdAt: string;
    status: string;
  };
}

export interface FileDiffProps {
  rawDiff: string;
}

export interface Change {
  type: 'insert' | 'delete' | 'normal';
  content: string;
}

export interface DiffBlock {
  header: string;
  changes: Change[];
}

export interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  aiResponse: string;
  aiPrompt: string;
  setAIPrompt: (prompt: string) => void;
  handleAIAnalysis: () => void;
  isAILoading: boolean;
}