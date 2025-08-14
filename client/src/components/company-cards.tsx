import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ExternalLink, ArrowLeft, Send, Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useNotification } from "@/contexts/notification-context";

interface Company {
  name: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  category: string;
}

interface CompanyCardsProps {
  companies: Company[];
}

export function CompanyCards({ companies }: CompanyCardsProps) {
  const [chatStates, setChatStates] = useState<{[key: number]: boolean}>({});
  const [messages, setMessages] = useState<{[key: number]: Array<{text: string, isUser: boolean}>}>({});
  const [inputValues, setInputValues] = useState<{[key: number]: string}>({});
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useFirebaseAuth();
  const { showFavoritesNotification } = useNotification();

  const handleChatClick = (index: number) => {
    setChatStates(prev => ({...prev, [index]: true}));
    if (!messages[index]) {
      setMessages(prev => ({...prev, [index]: [{text: `Hi! I'm here to help you learn more about ${companies[index].name}. What would you like to know?`, isUser: false}]}));
    }
  };

  const handleBackClick = (index: number) => {
    setChatStates(prev => ({...prev, [index]: false}));
  };

  const handleSendMessage = (index: number) => {
    const message = inputValues[index]?.trim();
    if (!message) return;

    setMessages(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), 
        {text: message, isUser: true},
        {text: `Thanks for your message about ${companies[index].name}. Our team will get back to you soon!`, isUser: false}
      ]
    }));
    setInputValues(prev => ({...prev, [index]: ""}));
  };

  const handleVisitWebsite = (website: string) => {
    if (website && website !== "#") {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
        {companies.map((company, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all rounded-lg p-4 min-w-[168px] h-[320px] flex-shrink-0">
            {chatStates[index] ? (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h5 className="text-white text-base font-medium">{company.name}</h5>
                  <Button
                    onClick={() => handleBackClick(index)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="bg-black/20 rounded-lg p-3 flex-1 overflow-y-auto space-y-2">
                  {(messages[index] || []).map((msg, msgIndex) => (
                    <div key={msgIndex} className={`text-xs ${msg.isUser ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block px-2 py-1 rounded ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={inputValues[index] || ""}
                    onChange={(e) => setInputValues(prev => ({...prev, [index]: e.target.value}))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(index)}
                    placeholder="Type your message..."
                    className="flex-1 h-8 text-xs bg-white/5 border-white/20 text-white"
                  />
                  <Button
                    onClick={() => handleSendMessage(index)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-white text-base font-medium">{company.name}</h5>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{company.category}</span>
                  </div>
                  {currentUser && (
                    <Button
                      onClick={() => {
                        const companyId = `company_${index}_${company.name}`;
                        if (isFavorite(companyId)) {
                          removeFromFavorites(companyId);
                        } else {
                          addToFavorites({
                            id: companyId,
                            type: 'company',
                            name: company.name,
                            description: company.description,
                            features: company.features,
                            pricing: company.pricing,
                            website: company.website,
                            category: company.category
                          }, showFavoritesNotification);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="p-1 h-auto"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(`company_${index}_${company.name}`) ? 'text-red-500 fill-current' : 'text-white/40 hover:text-red-400'}`} />
                    </Button>
                  )}
                </div>
                
                <p className="text-white/70 text-sm">{company.description}</p>
                
                <div>
                  <p className="text-xs text-white/60 mb-1">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {company.features.slice(0, 3).map((feature, featureIndex) => (
                      <span key={featureIndex} className="text-xs bg-white/5 text-white/80 border border-white/20 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-white/80 font-medium">{company.pricing}</div>
                
                <div className="flex space-x-1 mt-auto">
                  <Button
                    onClick={() => handleChatClick(index)}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Chat
                  </Button>
                  <Button
                    onClick={() => alert(`Calling ${company.name}...`)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2"
                  >
                    📞 Call
                  </Button>
                  {company.website && company.website !== "#" && (
                    <Button
                      onClick={() => handleVisitWebsite(company.website)}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/10 text-xs px-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}