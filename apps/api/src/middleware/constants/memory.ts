export const MEMORY_THRESHOLDS = {
    WARNING_RSS_PERCENTAGE: 70, // Warning at 70% of system memory
    CRITICAL_RSS_PERCENTAGE: 85, // Critical at 85% of system memory
    WARNING_HEAP_PERCENTAGE: 75, // Warning at 75% of max heap
    CRITICAL_HEAP_PERCENTAGE: 90, // Critical at 90% of max heap
    LEAK_DETECTION_INCREASES: 5, // Number of consecutive increases to trigger leak warning
};