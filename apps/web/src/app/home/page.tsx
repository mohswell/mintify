'use client';

import { useState, useEffect } from 'react';
import {
  FileIcon,
  GitBranchIcon,
  SparklesIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  User,
  Loader
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/views/ui/dialog';
import { fetchAllPRFileAnalysis, sendAICodeAnalysis } from '@/actions';
import { FileAnalysis } from '@/types';
import Image from 'next/image';
import { parseDiff, getFileIcon } from '@/lib/utils';
import { promptSuggestions } from '@/lib/helpers';
import { Button } from '@/components/views/login/Button';
import notification from '@/lib/notification';

export default function GitHubPRFileReview() {
  const [loading, setLoading] = useState(true);
  const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiResponse, setAIResponse] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [aiResponseHistory, setAiResponseHistory] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const loadAnalyses = async () => {
      try {
        notification({ type: "info", message: "Loading recents code changes from your Github repository..." });
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
        notification({ type: "error", message: "Failed to load file analyses:" });
        console.error('Failed to load file analyses:', error);
        setLoading(false);
      }
    };
    loadAnalyses();
  }, []);

  const handleAIAnalysis = async () => {
    const selectedFile = fileAnalyses.find(file => file.id === selectedFileId);
    if (!selectedFile) {
      console.log("No selected file");
      return;
    }

    setIsAILoading(true);

    try {
      const result = await sendAICodeAnalysis({
        fileDiff: selectedFile.rawDiff,
        prompt: aiPrompt,
        filePath: selectedFile.filePath
      });

      if (result.ok && result.data) {
        // Store the current response in history before setting new response
        setAiResponseHistory(prev => [result.data.text, ...prev].slice(0, 5)); // Keep last 5 responses
        setAIResponse(result.data.text);
        notification({ type: "success", message: "AI analysis successful!" });
      } else {
        setAIResponse(result.error || 'An unexpected error occurred');
      }
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
      setAIResponse('Sorry, there was an error processing your request.');
    } finally {
      setIsAILoading(false);
    }
  };

  const clearAIResponse = () => {
    setAIResponse('');
    setAIPrompt('');
  };

  const retryAIAnalysis = () => {
    // If there's a previous response in history, use its prompt
    if (aiResponseHistory.length > 0) {
      setAIPrompt(aiPrompt); // Reuse current prompt
      handleAIAnalysis();
    }
  };

  const handlePromptSuggestion = (suggestion: string) => {
    // Set the prompt and optionally trigger analysis
    setAIPrompt(prevPrompt =>
      prevPrompt ? `${prevPrompt}\n${suggestion}` : suggestion
    );
  };



  const renderDiff = (rawDiff: string) => {
    const diffBlocks = parseDiff(rawDiff);

    return (
      <div className="text-sm font-mono bg-gray-50 dark:bg-gray-900">
        {diffBlocks.map((block, blockIndex) => (
          <div key={blockIndex} className="border-b border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white px-4 py-2">
              {block.header}
            </div>
            {block.changes.map((change: any, changeIndex: any) => (
              <div
                key={changeIndex}
                className={`px-4 py-1 whitespace-pre 
                  ${change.type === 'insert' ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    change.type === 'delete' ? 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200' :
                      'bg-white dark:bg-gray-900'}`}
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
    <div className="flex min-h-screen bg-white dark:bg-dark text-black dark:text-white overflow-x-hidden">
      {/* Sidebar */}
      <div className="w-64 min-w-[16rem] bg-gray-50 dark:bg-dark border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto">
        <div className="flex items-center mb-3">
          <GitBranchIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          <h2 className="text-sm font-semibold">Files Changed</h2>
        </div>
        <div className="space-y-1">
          {fileAnalyses.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`flex items-center p-2 rounded-md cursor-pointer text-sm
                ${selectedFileId === file.id
                  ? 'bg-blue-100 dark:bg-white text-gray-900 dark:text-grey-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <FileIcon className={`w-4 h-4 mr-2 ${getFileIcon(file.filePath)}`} />
              <span className="truncate flex-1">{file.filePath}</span>
              <div className="flex space-x-1 ml-2">
                <span className="text-green-600 dark:text-green-400 text-xs">+{file.additions}</span>
                <span className="text-red-600 dark:text-red-400 text-xs">-{file.deletions}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="animate-spin h-10 w-10 text-gray-500" /> {/* Loading animation */}
          </div>
        ) : selectedFile ? (
          <div className="flex-1">
            {/* File Header */}
            <div className="bg-gray-50 dark:bg-dark border-b border-gray-200 dark:border-gray-800 p-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileIcon className={`w-5 h-5 ${getFileIcon(selectedFile.filePath)}`} />
                <span className="text-sm font-semibold">{selectedFile.filePath}</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon
                  onClick={() => setIsAIModalOpen(true)}
                  className="w-5 h-5 text-purple-500 dark:text-purple-400 cursor-pointer hover:text-purple-700"
                />
                {selectedFile?.pullRequest?.authorAvatar ? (
                  <Image
                    src={selectedFile.pullRequest.authorAvatar}
                    alt={selectedFile.pullRequest.author || 'Author'}
                    className="w-6 h-6 rounded-full"
                    width={32}
                    height={32}
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
            </div>

            {/* Diff View */}
            <div className="overflow-auto">
              {renderDiff(selectedFile.rawDiff)}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark">
            <div className="text-center">
              <FileIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Select a file to view its diff</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent size="xl" className="h-[90vh] flex flex-col dark:bg-dark dark:text-white">
          <DialogHeader>
            <DialogTitle>Bunjy AI Analysis</DialogTitle>
            <DialogDescription>
              Analyze the code changes for {selectedFile?.filePath}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
            {/* File Diff / AI Response Column */}
            <div className="overflow-auto bg-gray-50 dark:bg-dark p-4 rounded-md relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">
                  {aiResponse ? 'AI Analysis' : 'Code Changes'}
                </h3>
                {(aiResponse || selectedFile) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Toggle between code diff and AI response, but preserve both
                        setAIResponse(prevResponse =>
                          prevResponse === '' ? prevResponse : (prevResponse || '')
                        );
                      }}
                      className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                    >
                      {aiResponse ? 'Show Diff' : 'Show Analysis'}
                    </button>
                  </div>
                )}
              </div>

              {isAILoading ? (
                <div className="text-center text-gray-500">Analyzing...</div>
              ) : (
                <>
                  {aiResponse ? (
                    <pre
                      className="whitespace-pre-wrap text-sm bg-[#1E1E1E] text-[#D4D4D4] p-3 rounded-md font-mono overflow-auto max-h-[70vh]"
                      style={{
                        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                        tabSize: 2,
                        hyphens: 'none',
                        lineHeight: '1.5',
                        backgroundColor: '#1E1E1E', // Dark background typical for code editors
                        color: '#D4D4D4', // Light text color
                      }}
                    >
                      {aiResponse}
                    </pre>
                  ) : (
                    selectedFile && renderDiff(selectedFile.rawDiff)
                  )}
                </>
              )}
            </div>

            {/* AI Interaction Column */}
            <div className="flex flex-col">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="Provide additional context or ask specific questions about the code changes..."
                className="w-full min-h-[150px] border rounded-md p-3 mb-4 dark:bg-dark-800 dark:border-gray-700 dark:text-white"
              />

              <div className="flex space-x-2 mb-4">
                <Button
                  onClick={handleAIAnalysis}
                  disabled={isAILoading}
                  className="w-full"
                >
                  {isAILoading ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    "Get AI Analysis"
                  )}
                </Button>

                {aiResponse && (
                  <>
                    <button
                      onClick={clearAIResponse}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={retryAIAnalysis}
                      className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md px-3 py-2 text-sm"
                    >
                      Retry
                    </button>
                  </>
                )}
              </div>

              {/* Prompt Suggestions */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 dark:text-white mb-2">
                  Quick Prompt Suggestions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptSuggestion(suggestion)}
                      className="bg-gray-100 dark:bg-dark text-xs px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}