"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Commit {
    id: number;
    commitHash: string;
    message: string;
    authorName: string;
    date: string;
}

interface PullRequest {
    id: number;
    prNumber: number;
    title: string;
    author: string;
    authorUsername: string;
    url: string;
    baseBranch: string;
    headBranch: string;
    status: string;
    isDraft: boolean;
    labels: string[];
    createdAt: string;
    commits?: Commit[];
    stats: {
        additions: number;
        deletions: number;
        changedFiles: number;
    };
}

interface PullRequestStore {
    pullRequests: PullRequest[];
    setPullRequests: (pullRequests: PullRequest[]) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

export const usePullRequestStore = create<PullRequestStore>()(
    devtools((set) => ({
        pullRequests: [],
        setPullRequests: (pullRequests) => set({ pullRequests }),
        isLoading: true,
        setIsLoading: (isLoading) => set({ isLoading }),
        error: null,
        setError: (error) => set({ error }),
    }))
);
