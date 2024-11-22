import { Session as NextAuthSession, User as NextAuthUser } from 'next-auth';
import { JWT as NextAuthJWT } from 'next-auth/jwt';
import type { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
import type { DefaultSession } from 'next-auth'

// Extend the built-in session types
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }
}

export interface AuthUser {
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

export interface GitHubOauthUser extends NextAuthUser {
    id: string;
    email: string;
    name: string;
    image: string;
    githubProfileUrl?: string;
}

export interface AuthSession extends NextAuthSession {
    user: AuthUser;
    accessToken: string;
}

export interface AuthJWT extends NextAuthJWT {
    id: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
}
