import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

/**
 * Utility function to create and return a Supabase client instance
 * @param configService - ConfigService instance for accessing environment variables
 * @returns SupabaseClient
 */
export const SupabaseDBClient = (configService: ConfigService): SupabaseClient => {
  const SUPABASE_URL = configService.get<string>('SUPABASE_URL');
  const SUPABASE_KEY = configService.get<string>('SUPABASE_KEY');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase URL or Key is missing in the environment variables.');
  }

  return createClient(SUPABASE_URL, SUPABASE_KEY);
};