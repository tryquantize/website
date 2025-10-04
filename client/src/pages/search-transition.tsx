import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Users, Shield, BarChart3, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

interface FlowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const flowSteps: FlowStep[] = [
  {
    id: 1,
    title: "Understanding your requirements",
    description: "Analyzing your search query and specific business needs",
    icon: <Search className="w-5 h-5" />
  },
  {
    id: 2,
    title: "Discovering AI solutions",
    description: "Finding the best startups, tools, and products that match your criteria",
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 3,
    title: "Verifying quality and reliability",
    description: "Checking reviews, ratings, and credibility of AI solutions",
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 4,
    title: "Comparing features and pricing",
    description: "Analyzing capabilities, pricing models, and value propositions",
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 5,
    title: "Delivering smart recommendations",
    description: "Presenting the top AI solutions ranked by relevance and fit",
    icon: <CheckCircle className="w-5 h-5" />
  }
];

export default function SearchTransition() {
  const [, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('q') || '';
    const types = params.get('types');
    const currentSelectedTypes = types ? types.split(',').filter(t => t.trim()) : [];
    setQuery(searchQuery);

    // Start the search API call
    const searchPromise = apiRequest("POST", "/api/search", {
      query: searchQuery,
      context: {},
      selectedModel: "GPT-4o Mini",
      selectedTypes: currentSelectedTypes
    });

    let stepInterval: NodeJS.Timeout;
    let apiCompleted = false;
    let currentStepIndex = 0;
    
    // Mark API as completed when done
    searchPromise.then(() => {
      apiCompleted = true;
    }).catch(() => {
      apiCompleted = true;
    });

    // Start stepping through the flow chart slowly
    stepInterval = setInterval(() => {
      if (currentStepIndex < flowSteps.length - 1) {
        currentStepIndex++;
        setActiveStep(currentStepIndex);
      } else if (apiCompleted) {
        // Only navigate when both animation is complete AND API is done
        clearInterval(stepInterval);
        setLocation(`/results${window.location.search}`);
      }
      // If animation is done but API isn't, keep waiting
    }, 1000); // Slower 1 second per step

    return () => {
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [setLocation]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8">
      <AnimatedShaderBackground />
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">Deep Research in Progress</h1>
          <p className="text-lg text-white/80">
            Finding the best AI solutions for: <span className="text-white">"{query}"</span>
          </p>
        </div>

        <div className="space-y-6">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${index <= activeStep 
                  ? 'bg-white border-white text-black' 
                  : 'bg-black border-white/30 text-white/50'
                }
              `}>
                {step.icon}
              </div>
              
              <div className={`
                flex-1 transition-all duration-300
                ${index <= activeStep ? 'opacity-100' : 'opacity-50'}
              `}>
                <h3 className="text-white font-medium mb-1">{step.title}</h3>
                <p className="text-white/70 text-sm">{step.description}</p>
              </div>
              
              {index <= activeStep && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((activeStep + 1) / flowSteps.length) * 100}%` }}
            />
          </div>
          <p className="text-white/60 mt-2 text-sm">
            Step {activeStep + 1} of {flowSteps.length}
          </p>
        </div>
      </div>
    </div>
  );
}