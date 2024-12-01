import React from 'react';
import { FileIcon } from 'lucide-react';
import { FileAnalysis } from '@/types';
import { getFileIcon } from '@/lib/utils';

interface FileListProps {
    fileAnalysis: FileAnalysis[];
    selectedFileId: string;
    setSelectedFileId: (id: string) => void;
}

const FileList: React.FC<FileListProps> = ({ fileAnalysis, selectedFileId, setSelectedFileId }) => (
    <div className="space-y-1">
        {fileAnalysis.map((file) => (
            <div
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`flex items-center p-2 rounded-md cursor-pointer text-sm
          ${selectedFileId === file.id
                        ? 'bg-blue-100 dark:bg-dark text-dark dark:text-white'
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
);

export default FileList;