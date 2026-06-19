import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../services/api';

export function useApi(path, { enabled = true, method = 'GET' } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathRef = useRef(path);
  pathRef.current = path;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch(pathRef.current);
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
    if (enabled && method === 'GET') fetchData();
  }, [path, enabled, method, fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}
