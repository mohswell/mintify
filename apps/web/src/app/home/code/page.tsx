"use client";

import { useState, useEffect } from 'react';
import { Button } from "../../../components/views/ui/button";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from "../../../components/views/ui/card";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "../../../components/views/ui/table";
import { Badge } from "../../../components/views/ui/badge";
import { formatDistance } from 'date-fns';
import axios from 'axios';
import { API_URL } from '@/lib/env';
import { useAuthStore } from "@/stores/auth";

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
    commits: Array<{
        id: number;
        commitHash: string;
        message: string;
        authorName: string;
        date: string;
    }>;
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

    useEffect(() => {
        async function fetchPullRequests() {
            try {
                const token = useAuthStore.getState().token;
                const response = await axios.get(`${API_URL}/github/pull-requests`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setPullRequests(response.data);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch pull requests');
                setIsLoading(false);
            }
        }

        fetchPullRequests();
    }, []);

    if (isLoading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div>Loading pull requests...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="text-red-500">{error}</div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Code Reviews</h1>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Pull Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PR Number</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Branches</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Stats</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pullRequests.map((pr) => (
                                    <TableRow key={pr.id}>
                                        <TableCell>#{pr.prNumber}</TableCell>
                                        <TableCell>
                                            <a 
                                                href={pr.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                {pr.title}
                                            </a>
                                        </TableCell>
                                        <TableCell>{pr.authorUsername}</TableCell>
                                        <TableCell>
                                            {pr.baseBranch} → {pr.headBranch}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={
                                                    pr.isDraft ? 'outline' : 
                                                    pr.status === 'MERGED' ? 'secondary' : 
                                                    pr.status === 'CLOSED' ? 'destructive' : 
                                                    'default'
                                                }
                                            >
                                                {pr.isDraft ? 'Draft' : pr.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatDistance(new Date(pr.createdAt), new Date(), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell>
                                            +{pr.stats.additions} -{pr.stats.deletions} 
                                            ({pr.stats.changedFiles} files)
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}