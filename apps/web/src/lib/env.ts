import { assertValue } from "@/lib/helpers";

export const API_URL = assertValue(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "Missing environment variable: NEXT_PUBLIC_API_BASE_URL",
);
