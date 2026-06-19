import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';

export function useBootstrap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/bootstrap');
      setData(json);
      return json;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    config: data?.config ?? null,
    inputFiles: data?.inputFiles ?? [],
    outputFiles: data?.outputFiles ?? [],
    trashFiles: data?.trashFiles ?? [],
    customFonts: data?.fonts ?? [],
    loading,
    error,
    refetch,
    setData,
  };
}
