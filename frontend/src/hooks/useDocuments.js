import { useState, useEffect, useCallback } from 'react';
import { filesAPI } from '../services/api';

function useDocuments(initialFilters = {}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [lastKey, setLastKey] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters };
      if (lastKey) params.lastKey = lastKey;
      const res = await filesAPI.list(params);
      setFiles(res.data?.files || []);
      setTotal(res.data?.total || 0);
      setLastKey(res.data?.lastKey || null);
    } catch (err) {
      setError(err.message || 'Failed to load documents.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  function updateFilters(newFilters) {
    setLastKey(null);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }

  return { files, loading, error, total, filters, updateFilters, refresh: fetchFiles };
}

export default useDocuments;
