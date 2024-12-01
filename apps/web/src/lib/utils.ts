import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DiffBlock } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      throw new Error("Invalid token");
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export const parseDiff = (rawDiff: string): DiffBlock[] => {
  const lines = rawDiff.split('\n').slice(2); // Remove custom header
  const diffBlocks = [];
  let currentBlock: any = null;

  lines.forEach(line => {
    if (line.startsWith('+++') || line.startsWith('---')) {
      return;
    }

    if (line.startsWith('@@')) {
      if (currentBlock) {
        diffBlocks.push(currentBlock);
      }
      currentBlock = {
        header: line,
        changes: []
      };
    } else if (currentBlock) {
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

  if (currentBlock) {
    diffBlocks.push(currentBlock);
  }

  return diffBlocks;
};

export const getFileIcon = (filePath: string) => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  const iconMap: { [key: string]: string } = {
    'js': 'text-yellow-500',
    'jsx': 'text-blue-500',
    'ts': 'text-blue-600',
    'tsx': 'text-blue-700',
    'py': 'text-green-500',
    'md': 'text-gray-500',
    'json': 'text-pink-500'
  };
  return iconMap[extension || ''] || 'text-gray-400';
};