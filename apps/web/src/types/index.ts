export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export type ResearchLogType = 'reasoning' | 'tool_call' | 'tool_result';

export interface ResearchLog {
  id: string;
  type: ResearchLogType;
  title: string;
  content: string;
  timestamp: number;
  toolName?: string;
  success?: boolean;
}

