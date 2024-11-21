"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/auth/config/supabase'
import { useAuthStore } from '@/stores/auth'
import Cookies from 'js-cookie'
import { SESSION_NAME } from '@/lib/constants'
import { IconLoader } from "@tabler/icons-react"
import { AuthUser } from '@/auth/factories/authInterface'

export default function AuthCallback() {
    const router = useRouter()
    const setUser = useAuthStore((state) => state.setUser)
    const setToken = useAuthStore((state) => state.setToken)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleCallback = async () => {
            setLoading(true)
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error

                if (session) {
                    setToken(session.access_token)

                    // Transform Supabase user to mintify's app User type
                    const appUser: AuthUser = { 
                        id: session.user.id,
                        email: session.user.email ?? '',
                        first_name: session.user.user_metadata?.first_name ?? '',
                        last_name: session.user.user_metadata?.last_name ?? '',
                        username: session.user.user_metadata?.username || 'user',
                        phone_number: session.user.phone ?? '',
                        profile_image: session.user.user_metadata?.avatar_url,
                        created_at: session.user.created_at,
                        updated_at: session.user.updated_at ?? session.user.created_at,
                        is_admin: session.user.user_metadata?.is_admin ?? false,
                        is_inactive: session.user.user_metadata?.is_inactive ?? false
                    }

                    setUser(appUser)

                    Cookies.set(SESSION_NAME, session.access_token, {
                        secure: true,
                        sameSite: 'strict',
                    })

                    router.push('/home')
                }
            } catch (error) {
                console.error('Error:', error)
                router.push('/')
            }
            setLoading(false)
        }

        handleCallback()
    }, [router, setToken, setUser])

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                <IconLoader className="h-12 w-12 text-black dark:text-white animate-spin" />
            </div>
        )
    }

    return null
}