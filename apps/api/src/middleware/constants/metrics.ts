export const memoryHistory: Array<{ timestamp: number; heapUsed: number; rss: number }> = [];
export const HISTORY_LENGTH = 10; // Keep last 10 measurements