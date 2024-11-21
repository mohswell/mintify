import NextAuth from 'next-auth'
//import GithubProvider from 'next-auth/providers/github'
import { authOptions } from '@/auth/application/controller'

console.log('GitHub OAuth Config:', {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_SECRET
})

export default NextAuth(authOptions)