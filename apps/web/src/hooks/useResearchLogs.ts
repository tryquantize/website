import { useState, useEffect, useCallback } from 'react';
import { ResearchLog } from '@/types';

interface UseResearchLogsProps {
  query: string;
  selectedTypes: string[];
}

// Toggle between real streaming and simulation
const USE_REAL_STREAMING = false; // Set to true to use real SSE endpoint

const connectToResearchStream = (query: string, selectedTypes: string[], onLog: (log: Omit<ResearchLog, 'id' | 'timestamp'>) => void, onComplete: () => void) => {
  if (USE_REAL_STREAMING) {
    // Real SSE implementation
    const eventSource = new EventSource(`/api/research/stream?q=${encodeURIComponent(query)}&types=${selectedTypes.join(',')}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'complete') {
          onComplete();
          eventSource.close();
        } else if (data.type === 'connected') {
          // Connection established, do nothing
        } else {
          onLog(data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      onComplete();
    };
    
    return () => eventSource.close();
  } else {
    // Use simulation
    simulateResearchStream(query, onLog, onComplete);
    return () => {}; // No cleanup needed for simulation
  }
};

const simulateResearchStream = async (query: string, onLog: (log: Omit<ResearchLog, 'id' | 'timestamp'>) => void, onComplete: () => void) => {
  const logs = [
    {
      delay: 500,
      log: {
        type: 'reasoning' as const,
        title: 'Reasoning',
        content: `**Analyzing query**: "${query}"\n\nI need to search for AI tools and solutions that match this query. Let me break this down into specific search terms and categories.`
      }
    },
    {
      delay: 800,
      log: {
        type: 'tool_call' as const,
        title: 'Calling tool: web_search',
        content: `Searching for: "${query}" AI tools and solutions`,
        toolName: 'web_search'
      }
    },
    {
      delay: 1200,
      log: {
        type: 'tool_result' as const,
        title: 'Tool Executed',
        content: JSON.stringify({
          results_found: 15,
          top_sources: ['ProductHunt', 'GitHub', 'AI Directory'],
          status: 'success'
        }),
        toolName: 'web_search',
        success: true
      }
    },
    {
      delay: 600,
      log: {
        type: 'reasoning' as const,
        title: 'Reasoning',
        content: '**Analyzing search results**: Found several relevant AI tools. Now I need to enrich the data with company information and verify the quality of these solutions.'
      }
    },
    {
      delay: 700,
      log: {
        type: 'tool_call' as const,
        title: 'Calling tool: company_enrichment',
        content: 'Enriching company data for top 5 results',
        toolName: 'company_enrichment'
      }
    },
    {
      delay: 1000,
      log: {
        type: 'tool_result' as const,
        title: 'Tool Executed',
        content: JSON.stringify({
          companies_enriched: 5,
          data_points: ['funding', 'team_size', 'reviews', 'pricing'],
          status: 'success'
        }),
        toolName: 'company_enrichment',
        success: true
      }
    },
    {
      delay: 500,
      log: {
        type: 'reasoning' as const,
        title: 'Reasoning',
        content: '**Final analysis**: Ranking results based on relevance, quality metrics, and user requirements. Preparing comprehensive recommendations with detailed comparisons.'
      }
    }
  ];

  for (const { delay, log } of logs) {
    await new Promise(resolve => setTimeout(resolve, delay));
    onLog(log);
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  onComplete();
};

export function useResearchLogs({ query, selectedTypes }: UseResearchLogsProps) {
  const [logs, setLogs] = useState<ResearchLog[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const addLog = useCallback((log: Omit<ResearchLog, 'id' | 'timestamp'>) => {
    const newLog: ResearchLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  useEffect(() => {
    if (!query) return;

    setLogs([]);
    setIsStreaming(true);
    setIsComplete(false);

    const cleanup = connectToResearchStream(
      query,
      selectedTypes,
      addLog,
      () => {
        setIsStreaming(false);
        setIsComplete(true);
      }
    );

    return cleanup;
  }, [query, selectedTypes, addLog]);

  return {
    logs,
    isStreaming,
    isComplete,
  };
}