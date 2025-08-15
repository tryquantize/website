import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Clock, Search, Settings, LogOut } from 'lucide-react';
import { useConversations } from '@/contexts/conversation-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuantizeLogo } from '@/components/quantize-logo';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';


interface ConversationSidebarProps {
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  isMinimized: boolean;
}

export function ConversationSidebar({ onNewConversation, onSelectConversation, isMinimized }: ConversationSidebarProps) {
  const { conversations, currentConversation, deleteConversation, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const { signOut } = useFirebaseAuth();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed left-0 top-16 bottom-0 w-12 bg-white/5 backdrop-blur-2xl border-r border-white/15 flex flex-col z-30">
        <div className="flex-1" />
        <div className="p-2 space-y-2">
          <button className="w-full p-2 hover:bg-white/10 rounded transition-all" title="Settings">
            <Settings className="w-4 h-4 text-white/70 mx-auto" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-full p-2 hover:bg-white/10 rounded transition-all" 
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-white/70 mx-auto" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-16 bottom-0 w-80 bg-white/5 backdrop-blur-2xl border-r border-white/15 flex flex-col z-30">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <QuantizeLogo size={20} />
            <span>Quantize</span>
          </h2>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <p className="text-white/40 text-xs mt-1">
                  Start a new search to begin
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                    currentConversation?.id === conversation.id
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate mb-1">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-white/60">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(conversation.timestamp)}</span>
                        <span>•</span>
                        <span>{conversation.messages.length} messages</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Settings and Logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button className="w-full flex items-center space-x-3 p-2 hover:bg-white/10 rounded transition-all text-left">
          <Settings className="w-4 h-4 text-white/70" />
          <span className="text-sm text-white/70">Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-2 hover:bg-white/10 rounded transition-all text-left"
        >
          <LogOut className="w-4 h-4 text-white/70" />
          <span className="text-sm text-white/70">Logout</span>
        </button>
      </div>
    </div>
  );
}