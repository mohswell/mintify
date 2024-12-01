import React from 'react';
import { parseDiff } from '@/lib/utils';
import { Change, FileDiffProps } from '@/types';
  
const FileDiff: React.FC<FileDiffProps> = ({ rawDiff }) => {
    const diffBlocks = parseDiff(rawDiff);

    return (
        <div className="text-sm font-mono bg-gray-50 dark:bg-gray-900">
            {diffBlocks.map((block, blockIndex) => (
                <div key={blockIndex} className="border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-2">
                        {block.header}
                    </div>
                    {block.changes.map((change: Change, changeIndex: number) => (
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

export default FileDiff;