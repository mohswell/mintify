'use client';

import { useState, useEffect } from 'react';
import {
  FileIcon,
  GitBranchIcon,
  SparklesIcon,
  ChevronRightIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/views/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/views/ui/dialog';
import { Badge } from '@/components/views/ui/badge';
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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const { data, error } = await fetchAllPRFileAnalysis();
        if (data) {
          const processedAnalyses = data.map((analysis: { pullRequest: { authorUsername: any; author: any; authorAvatar: any }; }) => ({
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
      <div className="bg-white font-mono text-sm">
        {diffBlocks.map((block, blockIndex) => (
          <div key={blockIndex} className="border-b last:border-b-0 border-gray-200">
            <div className="bg-gray-50 text-gray-600 px-4 py-2">
              {block.header}
            </div>
            {block.changes.map((change: any, changeIndex: any) => (
              <div
                key={changeIndex}
                className={`px-4 py-1 whitespace-pre 
                  ${change.type === 'insert' ? 'bg-green-50 text-green-800' :
                    change.type === 'delete' ? 'bg-red-50 text-red-800' :
                      'bg-white'}`}
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

  const selectedFile = fileAnalyses.find(file => file.id === selectedFileId);

  return (
    <div className="flex min-h-screen dark:bg-dark bg-white text-black dark:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto dark:bg-dark bg-white text-black dark:text-white">
        <div className="flex items-center mb-4">
          <GitBranchIcon className="w-5 h-5 mr-2 text-gray-500" />
          <h2 className="text-lg font-semibold">Pull Request Files</h2>
        </div>
        <div className="space-y-2">
          {fileAnalyses.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 
                ${selectedFileId === file.id ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              <FileIcon className="w-4 h-4 mr-2" />
              <span className="truncate flex-1">{file.filePath}</span>
              <div className="flex space-x-1">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  +{file.additions}
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  -{file.deletions}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col dark:bg-dark bg-white text-black dark:text-white">
        {selectedFile ? (
          <div className="flex-1">
            {/* File Header */}
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  {selectedFile.pullRequest.title}
                </span>
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                <span>{selectedFile.filePath}</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon
                  onClick={() => setIsAIModalOpen(true)}
                  className="text-purple-500 cursor-pointer hover:text-purple-700"
                />
                {selectedFile.pullRequest.authorAvatar ? ( // Ensure the image is only rendered if the source is available
                  <img
                    src={selectedFile.pullRequest.authorAvatar}
                    alt={selectedFile.pullRequest.author}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300" /> // Placeholder if no avatar is available
                )}
              </div>
            </div>

            {/* Diff View */}
            <div className="p-4 overflow-auto ">
              {renderDiff(selectedFile.rawDiff)}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FileIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Select a file to view its diff</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Code Analysis for {selectedFile?.filePath}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              placeholder="Ask your AI assistant about this code..."
              className="w-full min-h-[150px] border rounded-md p-3"
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                className="border rounded-md p-2 hover:bg-gray-50"
                onClick={() => setIsAIModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
                onClick={() => {
                  // TODO: Implement AI API call
                  console.log('Sending prompt:', aiPrompt);
                }}
              >
                Send to AI
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}