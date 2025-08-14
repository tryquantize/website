import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ExternalLink, ArrowLeft, Send, User } from "lucide-react";

interface Freelancer {
  name: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  category: string;
}

interface FreelancerCardsProps {
  freelancers: Freelancer[];
}

export function FreelancerCards({ freelancers }: FreelancerCardsProps) {
  const [chatStates, setChatStates] = useState<{[key: number]: boolean}>({});
  const [messages, setMessages] = useState<{[key: number]: Array<{text: string, isUser: boolean}>}>({});
  const [inputValues, setInputValues] = useState<{[key: number]: string}>({});

  const handleChatClick = (index: number) => {
    setChatStates(prev => ({...prev, [index]: true}));
    if (!messages[index]) {
      setMessages(prev => ({...prev, [index]: [{text: `Hi! I'm ${freelancers[index].name}. I'd love to help with your project. What can I do for you?`, isUser: false}]}));
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
        {text: `Thanks for reaching out! I'd be happy to discuss your project. Let me know your requirements and timeline.`, isUser: false}
      ]
    }));
    setInputValues(prev => ({...prev, [index]: ""}));
  };

  const handleVisitProfile = (website: string) => {
    if (website && website !== "#") {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
        {freelancers.map((freelancer, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all rounded-lg p-4 min-w-[168px] h-[320px] flex-shrink-0">
            {chatStates[index] ? (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h5 className="text-white text-base font-medium">{freelancer.name}</h5>
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
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="text-white text-base font-medium">{freelancer.name}</h5>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{freelancer.category}</span>
                  </div>
                </div>
                
                <p className="text-white/70 text-sm">{freelancer.description}</p>
                
                <div>
                  <p className="text-xs text-white/60 mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {freelancer.features.slice(0, 3).map((skill, skillIndex) => (
                      <span key={skillIndex} className="text-xs bg-white/5 text-white/80 border border-white/20 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-white/80 font-medium">{freelancer.pricing}</div>
                
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
                    onClick={() => alert(`Hiring ${freelancer.name}...`)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2"
                  >
                    💼 Hire
                  </Button>
                  {freelancer.website && freelancer.website !== "#" && (
                    <Button
                      onClick={() => handleVisitProfile(freelancer.website)}
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