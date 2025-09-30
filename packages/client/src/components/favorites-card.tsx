import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ExternalLink, ArrowLeft, Send, Heart, Package, User, Building2 } from "lucide-react";
import { useFavorites, FavoriteItem } from "@/contexts/favorites-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface FavoritesCardProps {
  item: FavoriteItem;
}

export function FavoritesCard({ item }: FavoritesCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{text: `Hi! I'm here to help you learn more about ${item.name}. What would you like to know?`, isUser: false}]);
  const [inputValue, setInputValue] = useState("");
  const { removeFromFavorites } = useFavorites();

  const handleSendMessage = () => {
    const message = inputValue.trim();
    if (!message) return;

    setMessages(prev => [...prev, 
      {text: message, isUser: true},
      {text: `Thanks for your message about ${item.name}. Our team will get back to you soon!`, isUser: false}
    ]);
    setInputValue("");
  };

  const getIcon = () => {
    switch (item.type) {
      case 'company': return <Building2 className="w-4 h-4 text-white" />;
      case 'product': return <Package className="w-4 h-4 text-white" />;
      case 'freelancer': return <User className="w-4 h-4 text-white" />;
      default: return <Package className="w-4 h-4 text-white" />;
    }
  };

  const getColor = () => {
    switch (item.type) {
      case 'company': return 'bg-blue-500';
      case 'product': return 'bg-blue-500';
      case 'freelancer': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const getActionButton = () => {
    if (item.type === 'freelancer') {
      return (
        <Button
          onClick={() => alert(`Hiring ${item.name}...`)}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2"
        >
          💼 Hire
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => alert(`Calling ${item.name}...`)}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2"
        >
          📞 Call
        </Button>
      );
    }
  };

  if (chatOpen) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all rounded-lg p-4 h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-white text-base font-medium">{item.name}</h5>
          <Button
            onClick={() => setChatOpen(false)}
            size="sm"
            variant="outline"
            className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="bg-black/20 rounded-lg p-3 flex-1 overflow-y-auto space-y-2">
          {messages.map((msg, msgIndex) => (
            <div key={msgIndex} className={`text-xs ${msg.isUser ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-2 py-1 rounded ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2 mt-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 h-8 text-xs bg-white/5 border-white/20 text-white"
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all rounded-lg p-4 h-[320px] flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 ${getColor()} rounded-lg flex items-center justify-center`}>
            {getIcon()}
          </div>
          <div>
            <h5 className="text-white text-base font-medium">{item.name}</h5>
            <span className={`text-xs px-2 py-1 rounded-full ${
              item.type === 'company' ? 'bg-blue-500/20 text-blue-300' :
              item.type === 'product' ? 'bg-blue-500/20 text-blue-300' :
              'bg-purple-500/20 text-purple-300'
            }`}>
              {item.category}
            </span>
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-auto"
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-black/90 border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Remove from Favorites</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Are you sure you want to remove "{item.name}" from your favorites?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => removeFromFavorites(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <p className="text-white/70 text-sm mb-3 flex-1">{item.description}</p>
      
      <div className="mb-3">
        <p className="text-xs text-white/60 mb-1">
          {item.type === 'freelancer' ? 'Skills:' : 'Features:'}
        </p>
        <div className="flex flex-wrap gap-1">
          {item.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="text-xs bg-white/5 text-white/80 border border-white/20 px-2 py-1 rounded">
              {feature}
            </span>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-white/80 font-medium mb-3">{item.pricing}</div>
      
      <div className="flex space-x-1 mt-auto">
        <Button
          onClick={() => setChatOpen(true)}
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Chat
        </Button>
        {getActionButton()}
        {item.website && item.website !== "#" && (
          <Button
            onClick={() => window.open(item.website, "_blank", "noopener,noreferrer")}
            size="sm"
            variant="outline"
            className="border-white/20 text-white/80 hover:bg-white/10 text-xs px-1"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}