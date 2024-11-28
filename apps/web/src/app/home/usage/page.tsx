'use client';

import { useEffect, useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
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

interface FileAnalysis {
  id: string;
  prNumber: number;
  filePath: string;
  additions: number;
  deletions: number;
  rawDiff: string;
  fileType: string;
}

interface PullRequest {
  id: string;
  number: number;
  title: string;
  fileAnalyses: FileAnalysis[];
}

export default function FileAnalysisPage() {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPRs = async () => {
      const { data, error } = await fetchAllPRFileAnalysis();
      if (data) {
        setPullRequests(data);
        if (data.length > 0) {
          setSelectedPR(data[0].id);
        }
      }
      setLoading(false);
    };
    loadPRs();
  }, []);

  const selectedPullRequest = pullRequests.find(pr => pr.id === selectedPR);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">File Analysis</h1>
        
        <Select value={selectedPR} onValueChange={setSelectedPR}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a Pull Request" />
          </SelectTrigger>
          <SelectContent>
            {pullRequests.map((pr) => (
              <SelectItem key={pr.id} value={pr.id}>
                #{pr.number} - {pr.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPullRequest?.fileAnalyses.map((file) => (
        <Card key={file.id} className="mb-6">
          <CardHeader className="bg-muted">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{file.filePath}</h3>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  +{file.additions}
                </Badge>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  -{file.deletions}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <ReactDiffViewer
              oldValue=""
              newValue={file.rawDiff}
              splitView={false}
              useDarkTheme={false}
              hideLineNumbers={false}
              showDiffOnly={true}
              styles={{
                contentText: {
                  fontSize: '0.875rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              }}
            />
          </CardContent>
        </Card>
      ))}

      {(!selectedPullRequest || selectedPullRequest.fileAnalyses.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          No file analyses available for this pull request.
        </div>
      )}
    </div>
  );
}