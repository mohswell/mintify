"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/auth/config/supabase'
import { useAuthStore } from '@/stores/auth'
import Cookies from 'js-cookie'
import { SESSION_NAME } from '@/lib/constants'
import { IconLoader } from "@tabler/icons-react"
import notification from '@/lib/notification'
import { githubLogin } from '@/actions';

export default function GithubCallback() {
    const router = useRouter()
    const setUser = useAuthStore((state) => state.setUser)
    const setToken = useAuthStore((state) => state.setToken)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleGitHubCallback = async () => {
            try {
                // Get the current Supabase session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    notification({
                        type: "error",
                        message: "GitHub authentication failed"
                    });
                    router.push("/");
                    return;
                }

                // Fetch GitHub user details
                const userResponse = await fetch('https://api.github.com/user', {
                    headers: { 'Authorization': `Bearer ${session.provider_token}` }
                });

                const githubUser = await userResponse.json();

                const result = await githubLogin({
                    email: githubUser.email,
                    id: githubUser.id.toString(),
                    login: githubUser.login,
                    username: githubUser.login,
                    name: githubUser.name,
                    avatarUrl: githubUser.avatar_url,
                });

                if (result.ok) {
                    setToken(result.data.token);
                    setUser(result.data.user);

                    Cookies.set(SESSION_NAME, result.data.token, {
                        secure: true,
                        sameSite: 'strict'
                    });

                    notification({ message: "GitHub login successful!" });
                    router.push("/home");
                } else {
                    notification({
                        type: "error",
                        message: result.data.message || "GitHub login failed"
                    });
                    router.push("/");
                }
            } catch (error) {
                console.error('GitHub callback error:', error);
                notification({
                    type: "error",
                    message: "An unexpected error occurred"
                });
                router.push("/");
            } finally {
                setLoading(false); // Ensure loading is set to false in all scenarios
            }
        };

        handleGitHubCallback();
    }, [router, setToken, setUser]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                <IconLoader className="h-12 w-12 text-black dark:text-white animate-spin" />
            </div>
        )
    }

    return null
}