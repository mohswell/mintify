'use client';

import { useEffect, useState } from 'react';
import { Diff, parseDiff, tokenize } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import { fetchAllPRFileAnalysis } from '@/actions';
import { Card, CardHeader, CardContent } from '@/components/views/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/views/ui/select';
import { Badge } from '@/components/views/ui/badge';
import { FileIcon, GitBranchIcon } from 'lucide-react';
import notification from '@/lib/notification';

interface FileAnalysis {
    id: string;
    prNumber: number;
    filePath: string;
    additions: number;
    deletions: number;
    rawDiff: string;
    fileType: string;
    pullRequest: {
        title: string;
        url: string;
        author: string;
        createdAt: string;
        status: string;
    };
}

interface PullRequest {
    id: string;
    number: number;
    title: string;
    fileAnalyses: FileAnalysis[];
}

export default function FileAnalysisPage() {
    const [loading, setLoading] = useState(true);
    const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string>('');

    useEffect(() => {
        const loadAnalyses = async () => {
            const { data, error } = await fetchAllPRFileAnalysis();
            if (data) {
                setFileAnalyses(data);
                if (data.length > 0) {
                    setSelectedFileId(data[0].id);
                }
            }
            setLoading(false);
        };
        loadAnalyses();
    }, []);

    const selectedFile = fileAnalyses.find(file => file.id === selectedFileId);

    const renderDiff = (rawDiff: string) => {
        const files = parseDiff(rawDiff);

        return files.map((file, i) => (
            <Diff
                key={i}
                viewType="unified"
                diffType={file.type}
                hunks={file.hunks}
                tokens={tokenize(file.hunks)}
            >
                {(hunks) => hunks}
            </Diff>
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-7xl">
            <div className="mb-8 space-y-4">
                <div className="flex items-center space-x-2">
                    <GitBranchIcon className="w-6 h-6 text-gray-500" />
                    <h1 className="text-3xl font-bold">File Analysis</h1>
                </div>

                <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                    <SelectTrigger className="w-[400px]">
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
                <Card className="mb-6 border border-gray-200 rounded-lg shadow-sm">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <FileIcon className="w-5 h-5 text-gray-500" />
                                    <h3 className="text-lg font-semibold text-gray-700">{selectedFile.filePath}</h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="default" className="bg-green-50 text-green-700 border border-green-200">
                                        +{selectedFile.additions}
                                    </Badge>
                                    <Badge variant="destructive" className="bg-red-50 text-red-700 border border-red-200">
                                        -{selectedFile.deletions}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>PR #{selectedFile.prNumber}</span>
                                <span>•</span>
                                <span>{selectedFile.pullRequest.author}</span>
                                <span>•</span>
                                <span>{new Date(selectedFile.pullRequest.createdAt).toLocaleDateString()}</span>
                                <Badge className="capitalize">{selectedFile.pullRequest.status.toLowerCase()}</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto bg-white">
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