import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

export function useMetroRoute() {
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [compared, setCompared]   = useState(null);

  const findRoute = useCallback(async (from, to, algo = 'dijkstra') => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await axios.get(`${BASE}/api/route`, { params: { from, to, algo } });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const compareRoutes = useCallback(async (from, to) => {
    setLoading(true);
    setError(null);
    setCompared(null);
    try {
      const { data } = await axios.get(`${BASE}/api/route/compare`, { params: { from, to } });
      setCompared(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, compared, findRoute, compareRoutes };
}

export function useStations() {
  const [stations, setStations]           = useState([]);
  const [interchanges, setInterchanges]   = useState([]);
  const [connectivity, setConnectivity]   = useState(null);
  const [loading, setLoading]             = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, ic, conn] = await Promise.all([
        axios.get(`${BASE}/api/stations`),
        axios.get(`${BASE}/api/stations/interchanges`),
        axios.get(`${BASE}/api/stations/connectivity`),
      ]);
      setStations(s.data);
      setInterchanges(ic.data);
      setConnectivity(conn.data);
    } catch (e) {
      console.error('Failed to fetch stations:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stations, interchanges, connectivity, loading, fetchAll };
}
