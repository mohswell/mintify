import { assertValue } from "@/lib/helpers";

export const API_URL = assertValue(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "Missing environment variable: NEXT_PUBLIC_API_BASE_URL",
);

export const SUPABASE_URL = assertValue(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"
);

export const SUPABASE_ANON_KEY = assertValue(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
);
