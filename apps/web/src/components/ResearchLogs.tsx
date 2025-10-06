import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Activity, Wrench, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ResearchLog, ResearchLogType } from '@/types';

interface ResearchLogsProps {
  logs: ResearchLog[];
  isStreaming: boolean;
}

const getLogIcon = (type: ResearchLogType, success?: boolean) => {
  switch (type) {
    case 'reasoning':
      return <Activity className="w-4 h-4 text-blue-500" />;
    case 'tool_call':
      return <Wrench className="w-4 h-4 text-orange-500" />;
    case 'tool_result':
      return success ? 
        <CheckCircle className="w-4 h-4 text-green-500" /> : 
        <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

const formatContent = (content: string, type: ResearchLogType) => {
  if (type === 'reasoning') {
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }
  if (type === 'tool_result') {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }
  return content;
};

export default function ResearchLogs({ logs, isStreaming }: ResearchLogsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isCollapsed]);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {isStreaming && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            <h3 className="font-medium text-gray-900">Research</h3>
          </div>
          <span className="text-sm text-gray-500">({logs.length} entries)</span>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {!isCollapsed && (
        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
          {logs.map((log, index) => (
            <div
              key={log.id}
              className="bg-white rounded-md p-3 shadow-sm border border-gray-100 animate-in slide-in-from-top-2 fade-in duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getLogIcon(log.type, log.success)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {log.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {log.type === 'tool_result' ? (
                      <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                        {formatContent(log.content, log.type)}
                      </pre>
                    ) : (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: formatContent(log.content, log.type) 
                        }} 
                      />
                    )}
                  </div>
                  {log.toolName && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.toolName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isStreaming && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-gray-500">Processing...</span>
            </div>
          )}
          
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}