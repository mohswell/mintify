import { PullRequestStatus } from "@/types";

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

export const DEFAULT_PAGE = 1;

export const DEFAULT_TOTAL_ITEMS = 7;

export const ITEMS_PER_PAGE = 6;

export const PR_STATUS_SYMBOLS: Record<PullRequestStatus, string> = {
  pending: "⏳",
  approved: "👍🏾",
  closed: "❌",
};

export const SESSION_NAME = "bunjy-session";

export const AUTH_PROVIDER = "Github";