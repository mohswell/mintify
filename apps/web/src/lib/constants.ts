import { SubmissionStatus } from "@/types";

export enum Device {
  LAPTOP_4K = 2560,
  LAPTOP_2XL = 1680,
  LAPTOP_XL = 1512,
  LAPTOP_LG = 1440,
  LAPTOP = 1230,
  TABLET_LG = 1196,
  TABLET = 860,
  TABLET_SM = 580,
  MOBILE = 430,
  MOBILE_SM = 375,
}

export const MAX_IMAGE_SIZE = 10;

export const ITEMS_PER_PAGE = 6;

export const STATUS_SYMBOLS: Record<SubmissionStatus, string> = {
  pending: "⏳",
  approved: "👍🏾",
  rejected: "❌",
};

export const SESSION_NAME = "stucruum-session";

export const SUBMISSION_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Art", value: "art" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];
