export interface GitHubLogin {
    user: {
        id: string;
        email: string;
        user_name: string;
        name: string;
        avatar_url?: string;
        provider_id: string;
    };
}