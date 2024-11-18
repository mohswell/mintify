import { getSupabaseClient } from 'src/config/supabase';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export async function verifyToken(token: string, configService: ConfigService) {
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        const decoded = jwt.verify(token, configService.get<string>('JWT_SECRET') || 'secret_key') as any;

        const supabase = getSupabaseClient(configService); // Get Supabase client
        const { data: session, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('token', token)
            .eq('user_id', decoded.id)
            .single(); // Expecting a single session record

        if (error || !session) {
            throw new Error('Invalid session');
        }

        return decoded; // Return decoded payload if successful
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        throw new Error('Invalid token');
    }
}
