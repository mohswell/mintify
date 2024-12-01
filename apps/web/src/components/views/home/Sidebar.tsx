import React from 'react';
import FileList from './FileList';
import { FileAnalysis } from '@/types';

interface SidebarProps {
    fileAnalysis: FileAnalysis[];
    selectedFileId: string;
    setSelectedFileId: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ fileAnalysis, selectedFileId, setSelectedFileId }) => (
    <div className="w-64 min-w-[16rem] bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto">
        <h2 className="text-sm font-semibold">Files Changed</h2>
        <FileList fileAnalysis={fileAnalysis} selectedFileId={selectedFileId} setSelectedFileId={setSelectedFileId} />
    </div>
);

export default Sidebar;