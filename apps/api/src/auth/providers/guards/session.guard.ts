import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDBClient } from 'src/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionGuard {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = SupabaseDBClient(this.configService);
  }

  async createSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expiration for 24 hours
    const { error } = await this.supabase.from('sessions').insert([
      { user_id: userId, token, expires_at: expiresAt },
    ]);

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }
}
