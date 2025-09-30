import React, { useState } from 'react';
import { Search, ArrowRight, Brain, Building2, User, Package, Sparkles, Loader2, Undo, Plus, MessageSquare, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QuantizeLogo } from '@/components/quantize-logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from "@/hooks/use-location";
import { useConversations } from '@/contexts/conversation-context';
import { useAuth } from '@/lib/auth';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';

interface ConversationSidebarProps {
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  isMinimized: boolean;
  relatedQuestions?: string[];
  onQuestionClick?: (question: string) => void;
  aiResponse?: string;
  citations?: Array<{id: number, title: string, url: string}>;
  currentQuery?: string;
  conversationHistory?: Array<{question: string, answer: string, citations?: Array<{id: number, title: string, url: string}>, relatedQuestions?: string[]}>;
}

export function ConversationSidebar({ onNewConversation, onSelectConversation, isMinimized, relatedQuestions = [], onQuestionClick, aiResponse, citations = [], currentQuery, conversationHistory = [] }: ConversationSidebarProps) {
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [selectedModel, setSelectedModel] = useState("GPT-4o Mini");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [, setLocation] = useLocation();
  const { conversations } = useConversations();
  const { user } = useAuth();
  const { currentUser } = useFirebaseAuth();
  
  const firstName = currentUser?.displayName?.split(' ')[0] || 
                   currentUser?.email?.split('@')[0] || 
                   user?.name?.split(' ')[0] || 
                   'User';

  const llmModels = [
    "GPT-4o Mini",
    "Gemini 2.5 Flash", 
    "Qwen2.5 Coder 32B Instruct",
    "Meta Llama 3.2 3B Instruct"
  ];

  function toggleType(id: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const handleQuestionClick = async (question: string) => {
    setIsLoadingFollowUp(true);
    try {
      await onQuestionClick?.(question);
    } finally {
      setIsLoadingFollowUp(false);
    }
  };

  const handleFollowUpSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;
    
    setIsLoadingFollowUp(true);
    try {
      await onQuestionClick?.(followUpQuery);
      setFollowUpQuery('');
    } finally {
      setIsLoadingFollowUp(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed left-0 top-16 bottom-0 w-12 bg-white/5 backdrop-blur-2xl border-r border-white/15 flex flex-col z-30">
        <div className="flex-1" />
      </div>
    );
  }

  const renderResponse = (response: string, responseCitations: Array<{id: number, title: string, url: string}> = [], isCompact = false) => {
    let processedResponse = response;
    
    if (isCompact) {
      // Truncate to first 2 sentences and add intro
      const sentences = response.split(/[.!?]+/);
      const firstTwoSentences = sentences.slice(0, 2).join('. ').trim();
      processedResponse = `Here's what we found: ${firstTwoSentences}${firstTwoSentences.endsWith('.') ? '' : '.'}`;
    }
    
    const parts = processedResponse.split(/(\[\d+\])/);
    return parts.map((part, index) => {
      const citationMatch = part.match(/^\[(\d+)\]$/);
      if (citationMatch) {
        const citationNum = parseInt(citationMatch[1]);
        const citation = responseCitations.find(c => c.id === citationNum);
        if (citation) {
          return (
            <a 
              key={index}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
              title={citation.title}
            >
              [{citationNum}]
            </a>
          );
        }
        return (
          <span key={index} className="text-blue-400">
            [{citationNum}]
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="fixed left-0 top-16 bottom-0 w-80 bg-white/5 backdrop-blur-2xl border-r border-white/15 flex flex-col z-30">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-medium text-sm">Welcome {firstName}!</h2>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setLocation('/')}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>New search</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Conversation history clicked');
                      setShowConversationHistory(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Conversation history</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {showConversationHistory ? (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Back button clicked');
                  setShowConversationHistory(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="text-white font-medium">Conversation History</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(conversations).map(([id, conversation]) => (
                <div
                  key={id}
                  onClick={() => {
                    onSelectConversation(id);
                    setShowConversationHistory(false);
                  }}
                  className="bg-black/20 backdrop-blur-xl p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="text-white/90 text-sm font-medium mb-1 truncate">
                    {conversation.query}
                  </div>
                  <div className="text-white/60 text-xs">
                    {new Date(conversation.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-white/50 text-xs mt-1">
                    {conversation.messages.length} messages
                  </div>
                </div>
              ))}
              {Object.keys(conversations).length === 0 && (
                <div className="text-white/60 text-sm text-center py-8">
                  No conversations yet
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
        {/* Initial Question and Response */}
        {currentQuery && aiResponse && (
          <div>
            <div className="mb-3">
              <p className="text-sm text-white/80 font-medium">{currentQuery}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-xl p-3 border border-white/10 rounded-lg mb-4">
              <div className="text-white/90 text-xs leading-relaxed">
                {renderResponse(aiResponse, citations)}
              </div>
            </div>
            {relatedQuestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Related Questions</h4>
                <div className="space-y-0">
                  {relatedQuestions.map((question, index) => (
                    <div key={index}>
                      <button
                        onClick={() => handleQuestionClick(question)}
                        className="w-full text-left py-3 hover:bg-white/5 transition-all group flex items-center justify-between"
                      >
                        <span className="text-white/80 text-sm group-hover:text-white transition-colors pr-2">
                          {question}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
                      </button>
                      {index < relatedQuestions.length - 1 && (
                        <div className="border-b border-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.map((item, index) => (
          <div key={index}>
            <div className="mb-3">
              <p className="text-sm text-white/80 font-medium">{item.question}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-xl p-3 border border-white/10 rounded-lg mb-4">
              <div className="text-white/90 text-xs leading-relaxed">
                {renderResponse(item.answer, item.citations, true)}
              </div>
            </div>
            {item.relatedQuestions && item.relatedQuestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Related Questions</h4>
                <div className="space-y-0">
                  {item.relatedQuestions.map((question, qIndex) => (
                    <div key={qIndex}>
                      <button
                        onClick={() => handleQuestionClick(question)}
                        className="w-full text-left py-3 hover:bg-white/5 transition-all group flex items-center justify-between"
                      >
                        <span className="text-white/80 text-sm group-hover:text-white transition-colors pr-2">
                          {question}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
                      </button>
                      {qIndex < (item.relatedQuestions?.length ?? 0) - 1 && (
                        <div className="border-b border-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading State */}
        {isLoadingFollowUp && (
          <div className="bg-black/20 backdrop-blur-xl p-4 border border-white/10 rounded-lg animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <QuantizeLogo size={20} />
                <h3 className="text-sm font-semibold text-white">Quantize Searching...</h3>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded-full">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">AI Processing</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mb-2">Searching the web and finding the best AI solutions for your query...</p>
              <div className="space-y-1">
                <div className="h-2 bg-white/10 rounded animate-pulse"></div>
                <div className="h-2 bg-white/10 rounded animate-pulse w-3/4"></div>
                <div className="h-2 bg-white/10 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
      
      {/* Follow-up Search */}
      <div className="border-t border-white/10 p-3">
        <div className="relative rounded-[20px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-lg overflow-visible" style={{height: '65px'}}>
          {/* Search input area */}
          <div className="relative px-3 flex items-center" style={{height: '35px'}}>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {/* Prompt enhancer button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="Enhance search prompt"
                      disabled={!followUpQuery.trim() || isEnhancing}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 border border-white/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-2.5 w-2.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Enhance prompt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <button
                aria-label="Search"
                onClick={handleFollowUpSearch}
                disabled={!followUpQuery.trim() || isLoadingFollowUp}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 border border-white/20 text-white/90 hover:bg-white/10 transition disabled:opacity-50"
              >
                {isLoadingFollowUp ? (
                  <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="h-2.5 w-2.5" />
                )}
              </button>
            </div>

            <Input
              type="text"
              placeholder="Ask a follow-up question..."
              value={followUpQuery}
              onChange={(e) => setFollowUpQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFollowUpSearch(e);
                }
              }}
              disabled={isEnhancing}
              className="h-8 w-full border-0 bg-transparent shadow-none text-sm placeholder:text-white/70 text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-16 flex items-center disabled:opacity-70"
            />
          </div>

          {/* Bottom row - Icons */}
          <div className="relative border-t border-white/10 px-3 py-1.5" style={{height: '30px'}}>
            <div className="flex items-center justify-between">
              {/* Left - Brain icon with dropdown */}
              <div className="relative flex items-center space-x-1">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModelDropdown(!showModelDropdown);
                    }}
                    className={`flex h-4 w-4 items-center justify-center hover:text-white/80 transition-colors rounded-full border border-white/20 bg-white/5 ${
                      selectedModel && selectedModel !== "GPT-4o Mini" ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    <Brain className="h-2 w-2" />
                  </button>
                  
                  {showModelDropdown && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={() => setShowModelDropdown(false)} />
                      <div className="absolute bottom-6 left-0 z-[10001] bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl min-w-[150px] max-h-20 overflow-y-auto">
                        {llmModels.map((model) => (
                          <button
                            key={model}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModel(model);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full px-2 py-1 text-left text-xs hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              selectedModel === model ? 'bg-blue-600/20 text-blue-300' : 'text-white/80'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <span className="text-xs text-white/70">{selectedModel}</span>
              </div>

              {/* Right - Filter buttons */}
              <div className="flex items-center gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-4 w-4 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 ` +
                          (selectedTypes.has('company')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Company"
                        onClick={() => toggleType('company')}
                      >
                        <Building2 className="h-2 w-2" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Company</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-4 w-4 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 ` +
                          (selectedTypes.has('freelancer')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Freelancer"
                        onClick={() => toggleType('freelancer')}
                      >
                        <User className="h-2 w-2" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Freelancer</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          `h-4 w-4 rounded-full border backdrop-blur-md flex items-center justify-center transition hover:bg-white/10 ` +
                          (selectedTypes.has('product')
                            ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-300'
                            : 'bg-white/5 border-white/20 text-white/90')
                        }
                        aria-label="Product"
                        onClick={() => toggleType('product')}
                      >
                        <Package className="h-2 w-2" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Product</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}