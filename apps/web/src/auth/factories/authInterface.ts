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
    email: string;
    firstName: string;
    lastName: string;  
    username: string;
    phone?: string | null;
    isPremium: boolean;
    isAdmin: boolean;
    isInactive: boolean; 
    updatedAt: string;
    avatarUrl?: string;
    role: string; 
    maxRequestsPerDay: number;
    registrationDate: string; 
    isActive: boolean;
    aiUserToken?: string | null;
    githubId?: string | null;
    githubRepositoryUrl?: string | null;
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
