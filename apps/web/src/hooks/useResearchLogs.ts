import { useState, useEffect, useCallback } from 'react';
import { ResearchLog } from '@/types';

interface UseResearchLogsProps {
  query: string;
  selectedTypes: string[];
  webSearchEnabled?: boolean;
}

// Toggle between real streaming and simulation
const USE_REAL_STREAMING = false; // Set to true to use real SSE endpoint

const connectToResearchStream = (query: string, selectedTypes: string[], onLog: (log: Omit<ResearchLog, 'id' | 'timestamp'>) => void, onComplete: () => void, webSearchEnabled: boolean = true) => {
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
    simulateResearchStream(query, onLog, onComplete, webSearchEnabled);
    return () => {}; // No cleanup needed for simulation
  }
};

const simulateResearchStream = async (query: string, onLog: (log: Omit<ResearchLog, 'id' | 'timestamp'>) => void, onComplete: () => void, webSearchEnabled: boolean = true) => {
  const logs = [
    { delay: 500, log: { type: 'reasoning' as const, title: 'Query Preprocessing', content: `**Initializing research pipeline**: Starting comprehensive analysis for "${query}"` }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: query_parser', content: 'Parsing and tokenizing user query', toolName: 'query_parser' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ tokens: 3, intent: 'search', complexity: 'medium', status: 'success' }), toolName: 'query_parser', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Context Analysis', content: '**Building search context**: Analyzing query semantics and user intent patterns' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: context_builder', content: 'Building comprehensive search context', toolName: 'context_builder' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ context_score: 0.89, relevance_factors: ['technology', 'tools', 'AI'], status: 'success' }), toolName: 'context_builder', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Semantic Expansion', content: '**Expanding semantic scope**: Identifying related concepts and terminology variations' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: semantic_expander', content: 'Generating semantic variations and related terms', toolName: 'semantic_expander' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ variations: 12, synonyms: 8, related_concepts: 15, status: 'success' }), toolName: 'semantic_expander', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Search Strategy Formation', content: '**Formulating multi-vector search**: Planning parallel searches across diverse data sources' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: strategy_planner', content: 'Creating comprehensive search strategy', toolName: 'strategy_planner' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ search_vectors: 8, priority_sources: 5, estimated_results: 200, status: 'success' }), toolName: 'strategy_planner', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Primary Web Search Initiation', content: '**Launching primary search**: Querying major search engines and AI directories' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: web_crawler', content: 'Crawling web sources for relevant content', toolName: 'web_crawler' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ pages_crawled: 89, relevant_results: 47, domains: 23, status: 'success' }), toolName: 'web_crawler', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Content Filtering', content: '**Applying relevance filters**: Removing low-quality and irrelevant results from initial dataset' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: content_filter', content: 'Filtering and ranking search results by relevance', toolName: 'content_filter' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ filtered_results: 34, quality_score: 4.2, duplicates_removed: 13, status: 'success' }), toolName: 'content_filter', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'GitHub Repository Mining', content: '**Mining open-source repositories**: Searching GitHub for relevant projects and implementations' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: github_miner', content: 'Mining GitHub repositories and analyzing code quality', toolName: 'github_miner' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ repos_analyzed: 156, stars_total: '2.3M', active_projects: 89, languages: 12, status: 'success' }), toolName: 'github_miner', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Academic Literature Review', content: '**Conducting literature review**: Searching academic databases for research papers and publications' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: academic_searcher', content: 'Searching academic databases and research repositories', toolName: 'academic_searcher' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ papers_found: 234, h_index_avg: 12.4, recent_papers: 67, top_authors: 15, status: 'success' }), toolName: 'academic_searcher', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Patent Database Analysis', content: '**Analyzing patent landscape**: Searching patent databases for intellectual property and innovations' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: patent_analyzer', content: 'Analyzing patent filings and IP landscape', toolName: 'patent_analyzer' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ patents_found: 45, active_patents: 32, key_inventors: 8, innovation_trends: 'increasing', status: 'success' }), toolName: 'patent_analyzer', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Market Intelligence Gathering', content: '**Gathering market intelligence**: Analyzing market reports, funding data, and industry trends' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: market_intelligence', content: 'Collecting market data and industry analysis', toolName: 'market_intelligence' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ market_size: '$8.7B', growth_rate: '34.2%', key_segments: 4, investment_total: '$1.2B', status: 'success' }), toolName: 'market_intelligence', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Competitive Landscape Mapping', content: '**Mapping competitive landscape**: Identifying key players, market positioning, and competitive advantages' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: competitive_mapper', content: 'Mapping competitive landscape and market positions', toolName: 'competitive_mapper' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ competitors: 28, market_leaders: 5, emerging_players: 12, competitive_gaps: 3, status: 'success' }), toolName: 'competitive_mapper', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Technology Stack Analysis', content: '**Analyzing technology stacks**: Evaluating underlying technologies, frameworks, and architectures' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: tech_stack_analyzer', content: 'Analyzing technology stacks and architectural patterns', toolName: 'tech_stack_analyzer' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ frameworks: 15, languages: 8, cloud_platforms: 6, architecture_patterns: 12, status: 'success' }), toolName: 'tech_stack_analyzer', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Performance Metrics Collection', content: '**Collecting performance data**: Gathering benchmarks, speed tests, and scalability metrics' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: performance_collector', content: 'Collecting performance metrics and benchmark data', toolName: 'performance_collector' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ benchmarks: 67, avg_latency: '156ms', throughput_max: '50K rps', uptime_avg: '99.8%', status: 'success' }), toolName: 'performance_collector', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Security Assessment', content: '**Conducting security assessment**: Evaluating security features, vulnerabilities, and compliance standards' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: security_assessor', content: 'Assessing security posture and compliance status', toolName: 'security_assessor' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ security_score: 8.7, vulnerabilities: 2, compliance_certs: 8, encryption_grade: 'A+', status: 'success' }), toolName: 'security_assessor', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'User Experience Research', content: '**Researching user experience**: Analyzing user reviews, satisfaction scores, and usability metrics' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: ux_researcher', content: 'Researching user experience and satisfaction metrics', toolName: 'ux_researcher' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ user_reviews: 1247, satisfaction_score: 4.3, usability_rating: 8.2, support_quality: 4.1, status: 'success' }), toolName: 'ux_researcher', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Pricing Intelligence', content: '**Gathering pricing intelligence**: Analyzing pricing models, cost structures, and value propositions' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: pricing_intelligence', content: 'Analyzing pricing models and cost-benefit ratios', toolName: 'pricing_intelligence' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ pricing_models: 6, price_range: '$0-$5K/mo', roi_avg: '340%', cost_efficiency: 'high', status: 'success' }), toolName: 'pricing_intelligence', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Integration Capability Analysis', content: '**Analyzing integration capabilities**: Evaluating APIs, SDKs, and third-party integrations' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: integration_analyzer', content: 'Analyzing integration options and compatibility', toolName: 'integration_analyzer' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ api_endpoints: 45, sdk_languages: 12, integrations: 89, compatibility_score: 9.1, status: 'success' }), toolName: 'integration_analyzer', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Scalability Assessment', content: '**Assessing scalability potential**: Evaluating horizontal and vertical scaling capabilities' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: scalability_assessor', content: 'Assessing scalability limits and growth potential', toolName: 'scalability_assessor' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ max_scale: '1M+ users', auto_scaling: true, load_capacity: '500K rps', elasticity_score: 9.3, status: 'success' }), toolName: 'scalability_assessor', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Community Analysis', content: '**Analyzing community ecosystem**: Evaluating developer communities, support forums, and ecosystem health' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: community_analyzer', content: 'Analyzing community size and engagement metrics', toolName: 'community_analyzer' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ community_size: '45K developers', activity_score: 8.9, support_quality: 4.4, contribution_rate: 'high', status: 'success' }), toolName: 'community_analyzer', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Documentation Quality Review', content: '**Reviewing documentation quality**: Assessing completeness, clarity, and usefulness of documentation' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: docs_reviewer', content: 'Reviewing documentation quality and completeness', toolName: 'docs_reviewer' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ completeness: '92%', clarity_score: 4.6, examples: 156, tutorials: 23, status: 'success' }), toolName: 'docs_reviewer', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Trend Forecasting', content: '**Forecasting future trends**: Predicting technology evolution and market direction' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: trend_forecaster', content: 'Forecasting technology trends and market evolution', toolName: 'trend_forecaster' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ trend_confidence: 0.87, growth_projection: '45% next 2 years', emerging_tech: 4, disruption_risk: 'low', status: 'success' }), toolName: 'trend_forecaster', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Risk Assessment', content: '**Conducting risk assessment**: Evaluating technical, business, and operational risks' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: risk_assessor', content: 'Assessing various risk factors and mitigation strategies', toolName: 'risk_assessor' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ risk_score: 'low', technical_risks: 2, business_risks: 1, mitigation_plans: 5, status: 'success' }), toolName: 'risk_assessor', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Compliance Verification', content: '**Verifying compliance standards**: Checking regulatory compliance and industry standards adherence' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: compliance_verifier', content: 'Verifying compliance with industry standards', toolName: 'compliance_verifier' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ compliance_score: '98%', standards_met: 12, certifications: 8, audit_status: 'passed', status: 'success' }), toolName: 'compliance_verifier', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Innovation Index Calculation', content: '**Calculating innovation metrics**: Measuring innovation potential and technological advancement' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: innovation_calculator', content: 'Calculating innovation index and advancement metrics', toolName: 'innovation_calculator' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ innovation_index: 8.7, patent_activity: 'high', r_and_d_investment: '$45M', breakthrough_potential: 'significant', status: 'success' }), toolName: 'innovation_calculator', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Ecosystem Mapping', content: '**Mapping technology ecosystem**: Understanding partnerships, integrations, and ecosystem relationships' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: ecosystem_mapper', content: 'Mapping ecosystem relationships and partnerships', toolName: 'ecosystem_mapper' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ partnerships: 34, integrations: 67, ecosystem_health: 'robust', network_effect: 'strong', status: 'success' }), toolName: 'ecosystem_mapper', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Quality Assurance Testing', content: '**Performing quality assurance**: Running comprehensive quality tests and validation checks' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: qa_tester', content: 'Running quality assurance tests and validations', toolName: 'qa_tester' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ test_coverage: '94%', bug_density: 'low', reliability_score: 9.2, quality_grade: 'A+', status: 'success' }), toolName: 'qa_tester', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Data Synthesis', content: '**Synthesizing collected data**: Combining and normalizing data from all research sources' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: data_synthesizer', content: 'Synthesizing and normalizing research data', toolName: 'data_synthesizer' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ data_points: 2847, synthesis_accuracy: '96%', normalization_complete: true, insights_generated: 45, status: 'success' }), toolName: 'data_synthesizer', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Scoring Algorithm Application', content: '**Applying scoring algorithms**: Using weighted algorithms to score and rank all solutions' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: scoring_engine', content: 'Applying multi-criteria scoring algorithms', toolName: 'scoring_engine' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ solutions_scored: 89, criteria_weights: 12, top_score: 9.4, score_distribution: 'normal', status: 'success' }), toolName: 'scoring_engine', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Recommendation Generation', content: '**Generating recommendations**: Creating personalized recommendations based on comprehensive analysis' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: recommendation_generator', content: 'Generating personalized recommendations', toolName: 'recommendation_generator' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ recommendations: 15, personalization_score: 0.93, confidence_level: 'high', match_accuracy: '91%', status: 'success' }), toolName: 'recommendation_generator', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Final Validation', content: '**Performing final validation**: Cross-checking results and ensuring recommendation quality' }},
    { delay: 500, log: { type: 'tool_call' as const, title: 'Calling tool: result_validator', content: 'Validating final results and recommendations', toolName: 'result_validator' }},
    { delay: 500, log: { type: 'tool_result' as const, title: 'Tool Executed', content: JSON.stringify({ validation_passed: true, accuracy_score: '94%', completeness: '97%', quality_grade: 'A', status: 'success' }), toolName: 'result_validator', success: true }},
    { delay: 500, log: { type: 'reasoning' as const, title: 'Research Complete', content: '**Comprehensive research completed**: Analyzed 89 solutions across 67 criteria. Generated 15 high-confidence recommendations with 94% accuracy. Ready to present detailed findings with actionable insights and implementation guidance.' }}
  ];

  // Limit logs to 7 entries when web search is disabled
  const logsToShow = webSearchEnabled ? logs : logs.slice(0, 7);
  
  for (const { delay, log } of logsToShow) {
    await new Promise(resolve => setTimeout(resolve, delay));
    onLog(log);
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  onComplete();
};

export function useResearchLogs({ query, selectedTypes, webSearchEnabled = true }: UseResearchLogsProps) {
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
      },
      webSearchEnabled
    );

    return cleanup;
  }, [query, selectedTypes, webSearchEnabled, addLog]);

  return {
    logs,
    isStreaming,
    isComplete,
  };
}