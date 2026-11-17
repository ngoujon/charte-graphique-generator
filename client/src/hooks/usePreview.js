import { useEffect, useRef, useState, useCallback } from 'react';
import { API } from '../services/api';

const DEBOUNCE_MS = 900;

/**
 * Aperçu PDF en direct : rend le document côté serveur à partir de la
 * configuration courante (sans l'enregistrer), avec anti-rebond et annulation
 * des rendus devenus obsolètes.
 */
export function usePreview(config, refreshKey) {
  const [url, setUrl] = useState(null);
  const [pageMap, setPageMap] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const urlRef = useRef(null);
  const abortRef = useRef(null);
  const [manualTick, setManualTick] = useState(0);

  const refresh = useCallback(() => setManualTick((n) => n + 1), []);

  useEffect(() => {
    if (!config) return undefined;
    setStatus((s) => (s === 'ready' || s === 'error' ? 'pending' : s));
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus('loading');
      try {
        const res = await fetch(`${API}/generate/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Erreur ${res.status}`);
        }
        let map = {};
        try {
          map = JSON.parse(res.headers.get('X-Charte-Pages') || '{}');
        } catch {
          map = {};
        }
        const blob = await res.blob();
        const next = URL.createObjectURL(blob);
        const previous = urlRef.current;
        urlRef.current = next;
        setUrl(next);
        setPageMap(map);
        setError(null);
        setStatus('ready');
        if (previous) setTimeout(() => URL.revokeObjectURL(previous), 5000);
      } catch (e) {
        if (e.name === 'AbortError') return;
        setError(e.message);
        setStatus('error');
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [config, refreshKey, manualTick]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  return { url, pageMap, status, error, refresh };
}
