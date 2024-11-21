import { AuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { supabase } from '../config/supabase'

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
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              scopes: 'read:user user:email',
            },
          })
          
          if (error) throw error
          
          return true
        } catch (error) {
          console.error('Error:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
}