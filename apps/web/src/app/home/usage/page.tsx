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
import { FileIcon, GitBranchIcon, ChevronDownIcon } from 'lucide-react';
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

interface DiffFile {
    type: string;
    hunks: DiffHunk[];
    additions: number;
    deletions: number;
}

interface DiffHunk {
    content: string;
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    changes: DiffChange[];
}

interface DiffChange {
    type: 'add' | 'del' | 'normal';
    content: string;
    lineNumber?: number;
    newLineNumber?: number;
}

const parseGitDiff = (rawDiff: string) => {
    const lines = rawDiff.split('\n');
    const fileNameMatch = lines.length > 0 ? lines[0].match(/^### File: (.+)/) : null;
    const fileName = fileNameMatch ? fileNameMatch[1] : '';

    // Remove the custom header to get pure git diff
    const pureDiff = lines.slice(2).join('\n');

    return {
        fileName,
        diff: pureDiff
    };
};

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

    const parseDiffHeader = (rawDiff: string) => {
        const lines = rawDiff.split('\n');
        const fileNameMatch = lines[0].match(/^### File: (.+)/);
        const fileName = fileNameMatch ? fileNameMatch[1] : '';
        return { fileName };
    };

    const renderDiff = (rawDiff: string) => {
        const { fileName, diff } = parseGitDiff(rawDiff);
        const files = parseDiff(diff);

        return files.map((file: DiffFile, i: number) => (
            <div key={i} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                {/* File Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <FileIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-mono text-sm text-gray-700">{fileName}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="text-green-600">+{file.additions}</span>
                        <span className="text-red-600">−{file.deletions}</span>
                    </div>
                </div>

                {/* Diff Content */}
                <div className="overflow-x-auto bg-white">
                    <Diff
                        viewType="unified"
                        diffType={file.type}
                        hunks={file.hunks}
                        tokens={tokenize(file.hunks)}
                    >
                        {(hunks: DiffHunk[]) => (
                            <table className="w-full border-collapse font-mono text-sm">
                                <tbody>
                                    {hunks.map((hunk: DiffHunk) => (
                                        <>
                                            {/* Hunk Header */}
                                            <tr className="bg-gray-100 text-gray-600">
                                                <td colSpan={2} className="pl-3 w-[1%] whitespace-nowrap border-r border-gray-200">
                                                    ...
                                                </td>
                                                <td className="px-3 py-1">
                                                    @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                                                </td>
                                            </tr>
                                            {/* Hunk Changes */}
                                            {hunk.changes.map((change, idx) => (
                                                <tr key={idx}
                                                    className={
                                                        change.type === 'add' ? 'bg-green-50' :
                                                            change.type === 'del' ? 'bg-red-50' : 'bg-white'
                                                    }
                                                >
                                                    <td className="pl-3 pr-2 text-right text-gray-500 w-[1%] whitespace-nowrap border-r border-gray-200">
                                                        {change.type !== 'add' ? change.lineNumber : ' '}
                                                    </td>
                                                    <td className="pl-3 pr-2 text-right text-gray-500 w-[1%] whitespace-nowrap border-r border-gray-200">
                                                        {change.type !== 'del' ? change.newLineNumber : ' '}
                                                    </td>
                                                    <td className={`px-3 whitespace-pre ${change.type === 'add' ? 'text-green-700' :
                                                            change.type === 'del' ? 'text-red-700' : ''
                                                        }`}>
                                                        {change.type === 'add' ? '+' : change.type === 'del' ? '-' : ' '}
                                                        {change.content}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Diff>
                </div>
            </div>
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
                                    <Badge className="bg-green-50 text-green-700 border border-green-200">
                                        +{selectedFile.additions}
                                    </Badge>
                                    <Badge className="bg-red-50 text-red-700 border border-red-200">
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