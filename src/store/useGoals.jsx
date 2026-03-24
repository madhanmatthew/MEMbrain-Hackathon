import { createContext, useContext, useState, useCallback } from 'react';
import { storeMemory, searchMemories, getGraph, getStats, waitForJob } from '../api/membrain';

const GoalsContext = createContext();

export function GoalsProvider({ children }) {
  const [goals, setGoals]         = useState([]);
  const [events, setEvents]       = useState([]);
  const [insights, setInsights]   = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const createGoal = useCallback(async (title, reasoning, target) => {
    setLoading(true); setError(null);
    try {
      const job = await storeMemory({
        content: `GOAL: ${title}. Reasoning: ${reasoning}. Target: ${target}`,
        metadata: { type: 'goal', title, target }
      });
      const jobId = job.job_id || job.id || job.jobId;
      const result = await waitForJob(jobId);
      const memId = result.memory_id || result.id || result.data?.id;
      const newGoal = { id: memId, title, reasoning, target, memId, createdAt: Date.now() };
      setGoals(prev => [...prev, newGoal]);
      return newGoal;
    } catch(e) {
      setError(e.message);
      console.error('createGoal failed:', e);
    } finally { setLoading(false); }
  }, []);

  const logEvent = useCallback(async (goalId, description) => {
    setLoading(true); setError(null);
    try {
      const job = await storeMemory({
        content: description,
        metadata: { type: 'event', goalId }
      });
      const jobId = job.job_id || job.id || job.jobId;
      const result = await waitForJob(jobId);
      const memId = result.memory_id || result.id || result.data?.id;
      const newEvent = { id: memId, goalId, description, memId, createdAt: Date.now() };
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch(e) {
      setError(e.message);
      console.error('logEvent failed:', e);
    } finally { setLoading(false); }
  }, []);

  const askGoals = useCallback(async (query) => {
    setLoading(true); setError(null);
    try {
      const results = await searchMemories(query);
      const list = results?.results || results?.memories || results || [];
      setInsights(list);
      return list;
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadGraph = useCallback(async (memoryId) => {
    setLoading(true); setError(null);
    try {
      const raw = await getGraph(memoryId);
      const shaped = shapeForD3(raw);
      setGraphData(shaped);
      return shaped;
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
      return data;
    } catch(e) { setError(e.message); }
  }, []);

  return (
    <GoalsContext.Provider value={{
      goals, events, insights, graphData, stats,
      loading, error,
      createGoal, logEvent, askGoals, loadGraph, loadStats
    }}>
      {children}
    </GoalsContext.Provider>
  );
}

export const useGoals = () => useContext(GoalsContext);

function shapeForD3(raw) {
  if (!raw) return { nodes: [], links: [] };
  const nodes = (raw.nodes || []).map(n => ({
    id: n.id,
    label: (n.content || '').slice(0, 40),
    type: n.metadata?.type || 'event',
    isGoal: n.metadata?.type === 'goal',
  }));
  const links = (raw.edges || raw.links || []).map(e => ({
    source: e.source || e.from,
    target: e.target || e.to,
    strength: e.weight || e.similarity_score || 0.5,
  }));
  return { nodes, links };
}