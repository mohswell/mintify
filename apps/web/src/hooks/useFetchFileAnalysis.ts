import { useEffect, useState } from 'react';
import { fetchAllPRFileAnalysis } from '@/actions';
import { FileAnalysis } from '@/types';

const useFetchFileAnalysis = () => {
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const { data, error } = await fetchAllPRFileAnalysis();
        if (data) {
          setFileAnalysis(data);
        }
        setLoading(false);
      } catch (error: any) {
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    };
    loadAnalyses();
  }, []);

  return { fileAnalysis, loading, error };
};

export default useFetchFileAnalysis;