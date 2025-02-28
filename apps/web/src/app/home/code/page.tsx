"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/views/ui/button";
import {
    Card,
    CardContent,
    // CardHeader,
    // CardTitle
} from "@/components/views/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/views/ui/input";
import { Badge } from "@/components/views/ui/badge";
import { formatDistance } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/views/ui/select';
import { fetchPullRequests } from '@/actions';
import { IconLoader } from "@tabler/icons-react";
import notification from '@/lib/notification';

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

export default function Dashboard() {
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        async function loadPullRequests() {
            notification({
                type: 'info',
                message: 'Loading pull requests from Github...',
            });
            try {
                setIsLoading(true);
                const { data, error } = await fetchPullRequests();

                if (error) {
                    setError(error);
                    notification({
                        type: 'error',
                        message: error || 'Failed to fetch pull requests'
                    });
                } else {
                    setPullRequests(data);
                    notification({
                        type: 'success',
                        message: `Loaded ${data.length} pull requests`
                    });
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
                setError(errorMessage);
                notification({
                    type: 'error',
                    message: errorMessage
                });
            } finally {
                setIsLoading(false);
            }
        }

        loadPullRequests();
    }, []);

    const filteredPRs = pullRequests.filter((pr) => {
        const matchesSearch =
            pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pr.authorUsername.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            pr.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50">
                <div className="flex flex-col items-center">
                    <IconLoader className="h-12 w-12 text-black dark:text-white animate-spin" />
                    <p className="mt-4 text-lg animate-pulse">Loading pull requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="text-red-500 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold mb-4">Error Loading Pull Requests</p>
                        <p>{error}</p>
                        <Button
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Pull Requests</h1>
                <Button variant="default">New Pull Request</Button>
            </div>

            {pullRequests.length === 0 ? (
                <div
                    className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
                    x-chunk="dashboard-02-chunk-1"
                >
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            You have no code reviews
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You can start setting the app in GitHub PRs
                        </p>
                        <Button className="mt-4">Add Product</Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search pull requests..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="merged">Merged</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        {filteredPRs.map((pr) => (
                            <Card
                                key={pr.id}
                                className="hover:bg-muted/50 transition-colors animate-fade-in-up"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        pr.isDraft ? 'outline' :
                                                            pr.status === 'MERGED' ? 'secondary' :
                                                                pr.status === 'CLOSED' ? 'destructive' :
                                                                    'default'
                                                    }
                                                    className="h-6"
                                                >
                                                    {pr.isDraft ? 'Draft' : pr.status}
                                                </Badge>
                                                <a
                                                    href={pr.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg font-semibold hover:underline"
                                                >
                                                    {pr.title}
                                                </a>
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                #{pr.prNumber} opened {formatDistance(new Date(pr.createdAt), new Date(), { addSuffix: true })} by {pr.authorUsername}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <span>+{pr.stats.additions}</span>
                                                <span>-{pr.stats.deletions}</span>
                                            </div>
                                            <div>{pr.stats.changedFiles} files</div>
                                        </div>
                                    </div>

                                    {pr.labels && pr.labels.length > 0 && (
                                        <div className="mt-2 flex gap-2">
                                            {pr.labels.map((label, index) => (
                                                <Badge key={index} variant="outline">{label}</Badge>
                                            ))}
                                        </div>
                                    )}

                                    {pr.commits && pr.commits.length > 0 && (
                                        <div className="mt-4 text-sm text-muted-foreground">
                                            <div className="font-medium">Latest commit:</div>
                                            <div className="mt-1 font-mono">
                                                {pr.commits?.[0]?.commitHash.substring(0, 7)} - {pr.commits?.[0]?.message}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}