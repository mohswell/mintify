import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/views/ui/dialog';
import { AIDialogProps } from '@/types';
import { Loader } from "lucide-react";
import { Button } from '../login/Button';

const AIDialog: React.FC<AIDialogProps> = ({ isOpen, onClose, aiResponse, aiPrompt, setAIPrompt, handleAIAnalysis, isAILoading }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent size="xl" className="h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Bunjy AI</DialogTitle>
                <DialogDescription>
                    Analyze the code changes
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1">
                <textarea
                    value={aiPrompt}
                    onChange={(e) => setAIPrompt(e.target.value)}
                    placeholder="Provide additional context or ask specific questions about the code changes..."
                    className="w-full min-h-[150px] border rounded-md p-3 mb-4 dark:bg-dark dark:border-gray-700 dark:text-white"
                />
                <Button
                    onClick={handleAIAnalysis}
                    disabled={isAILoading}
                    className="w-full"
                     type="submit"
                >
                    {isAILoading ? (
                        <Loader className="size-4 animate-spin" />
                    ) : (
                        "Get AI Analysis"
                    )}
                </Button>
  2              {aiResponse && <div className="whitespace-pre-wrap text-sm">{aiResponse}</div>}
            </div>
        </DialogContent>
    </Dialog>
);

export default AIDialog;