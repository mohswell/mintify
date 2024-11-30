'use client';

import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/views/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/views/ui/select';
import { Badge } from '@/components/views/ui/badge';
import { FileIcon, GitBranchIcon, GitCommitIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { fetchAllPRFileAnalysis } from '@/actions';

interface FileAnalysis {
    id: string;
    prNumber: number;
    filePath: string;
    additions: number;
    deletions: number;
    rawDiff: string;
    fileType: string;
    pullRequest: {
        id: string;
        title: string;
        url: string;
        author: string;
        authorUsername?: string;
        authorAvatar?: string;
        createdAt: string;
        status: string;
    };
}

// Custom diff parsing function
const parseDiff = (rawDiff: string) => {
    const lines = rawDiff.split('\n').slice(2); // Remove custom header
    const diffBlocks = [];
    let currentBlock: any = null;

    lines.forEach(line => {
        if (line.startsWith('+++') || line.startsWith('---')) {
            // File header lines, skip
            return;
        }

        if (line.startsWith('@@')) {
            // Start of a new hunk
            if (currentBlock) {
                diffBlocks.push(currentBlock);
            }
            currentBlock = {
                header: line,
                changes: []
            };
        } else if (currentBlock) {
            // Diff lines
            if (line.startsWith('+')) {
                currentBlock.changes.push({
                    type: 'insert',
                    content: line.slice(1),
                });
            } else if (line.startsWith('-')) {
                currentBlock.changes.push({
                    type: 'delete',
                    content: line.slice(1),
                });
            } else if (line.startsWith(' ')) {
                currentBlock.changes.push({
                    type: 'normal',
                    content: line.slice(1),
                });
            }
        }
    });

    // Add last block
    if (currentBlock) {
        diffBlocks.push(currentBlock);
    }

    return diffBlocks;
};

export default function FileAnalysisPage() {
    const [loading, setLoading] = useState(true);
    const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string>('');

    useEffect(() => {
        const loadAnalyses = async () => {
            try {
                const { data, error } = await fetchAllPRFileAnalysis();
                if (data) {
                    const processedAnalyses = data.map((analysis: { pullRequest: { authorUsername: any; author: any; }; }) => ({
                        ...analysis,
                        pullRequest: {
                            ...analysis.pullRequest,
                            author: analysis.pullRequest?.authorUsername || analysis.pullRequest?.author || 'Unknown',
                        }
                    }));

                    setFileAnalyses(processedAnalyses);
                    if (processedAnalyses.length > 0) {
                        setSelectedFileId(processedAnalyses[0].id);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to load file analyses:', error);
                setLoading(false);
            }
        };
        loadAnalyses();
    }, []);

    const renderDiff = (rawDiff: string) => {
        const diffBlocks = parseDiff(rawDiff);
        
        return (
            <div className="bg-white">
                {diffBlocks.map((block, blockIndex) => (
                    <div key={blockIndex} className="border-b last:border-b-0 border-gray-200">
                        <div className="bg-gray-100 text-gray-600 px-4 py-2 font-mono text-sm">
                            {block.header}
                        </div>
                        {block.changes.map((change: { type: string; content: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }, changeIndex: Key | null | undefined) => (
                            <div 
                                key={changeIndex} 
                                className={`
                                    px-4 py-1 font-mono text-sm whitespace-pre 
                                    ${change.type === 'insert' ? 'bg-green-50 text-green-800' : 
                                      change.type === 'delete' ? 'bg-red-50 text-red-800' : 
                                      'bg-white'}
                                `}
                            >
                                {change.type === 'insert' ? '+' : change.type === 'delete' ? '-' : ' '}
                                {change.content}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const selectedFile = fileAnalyses.find(file => file.id === selectedFileId);

    return (
        <div className="container mx-auto py-8 max-w-7xl">
            <div className="mb-8 space-y-4">
                <div className="flex items-center space-x-3">
                    <GitBranchIcon className="w-6 h-6 text-gray-500" />
                    <h1 className="text-3xl font-bold">Pull Request File Analysis</h1>
                </div>

                <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                    <SelectTrigger className="w-full max-w-2xl">
                        <SelectValue placeholder="Select a file to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                        {fileAnalyses.map((file) => (
                            <SelectItem key={file.id} value={file.id}>
                                <div className="flex items-center space-x-2">
                                    <FileIcon className="w-4 h-4" />
                                    <span>{file.filePath}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedFile && (
                <Card className="border border-gray-200 rounded-lg shadow-sm">
                    <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <GitCommitIcon className="w-5 h-5 text-gray-500" />
                                    <Link 
                                        href={selectedFile.pullRequest.url} 
                                        target="_blank" 
                                        className="text-lg font-semibold text-blue-600 hover:underline"
                                    >
                                        {selectedFile.pullRequest.title}
                                    </Link>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge 
                                        variant="outline" 
                                        className="bg-green-50 text-green-700 border-green-200"
                                    >
                                        +{selectedFile.additions}
                                    </Badge>
                                    <Badge 
                                        variant="outline" 
                                        className="bg-red-50 text-red-700 border-red-200"
                                    >
                                        -{selectedFile.deletions}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    <span>{selectedFile.pullRequest.author}</span>
                                </div>
                                <span>•</span>
                                <span>PR #{selectedFile.prNumber}</span>
                                <span>•</span>
                                <span>{new Date(selectedFile.pullRequest.createdAt).toLocaleDateString()}</span>
                                <Badge 
                                    variant="secondary" 
                                    className="capitalize"
                                >
                                    {selectedFile.pullRequest.status.toLowerCase()}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="diff-wrapper text-sm">
                            {renderDiff(selectedFile.rawDiff)}
                        </div>
                    </CardContent>
                </Card>
            )}

            {(!selectedFile || !fileAnalyses.length) && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No file analyses available.</p>
                </div>
            )}
        </div>
    );
}