import { AuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { supabase } from '../config/supabase'
import { getSession } from '../factories/authHelpers';

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        try {
          // Use Supabase OAuth
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`,
            },
          })
          
          if (error) throw error
          
          return true
        } catch (error) {
          console.error('GitHub OAuth Error:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      try {
        // Fetch Supabase session
        const { session: supabaseSession } = await getSession()
        
        if (supabaseSession?.user) {
          // Enhance session with Supabase user details
          session.user = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email,
            name: supabaseSession.user.user_metadata?.full_name,
            image: supabaseSession.user.user_metadata?.avatar_url,
            // Add any additional user metadata you want to store
          }

          // Store additional user details in token for API requests
          token.supabaseUser = {
            ...supabaseSession.user,
            accessToken: supabaseSession.access_token
          }
        }

        return session
      } catch (error) {
        console.error('Session fetch error:', error)
        return session
      }
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  }
}

// Extend default types to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    supabaseUser?: {
      id: string
      email?: string
      access_token?: string
      [key: string]: any
    }
  }
}