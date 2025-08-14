import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";

export default function WelcomeTransition() {
  const [, setLocation] = useLocation();
  const { currentUser } = useFirebaseAuth();
  const [displayText, setDisplayText] = useState("");
  const [isBlurring, setIsBlurring] = useState(false);

  // Get user's first name
  const firstName = currentUser?.displayName?.split(' ')[0] || 
                   currentUser?.email?.split('@')[0] || 
                   'User';

  const fullText = `Hey ${firstName}, welcome to Quantize`;

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    
    // Typewriter effect
    const typeWriter = () => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex++;
        if (currentIndex <= fullText.length) {
          timeoutId = setTimeout(typeWriter, 150); // 150ms per character for better visibility
        } else {
          // Typewriter complete, wait 2 seconds then start blur
          setTimeout(() => {
            setIsBlurring(true);
            // Redirect after 1.5 seconds of blur
            setTimeout(() => {
              setLocation('/loggedinhome');
            }, 1500);
          }, 2000);
        }
      }
    };

    // Start typewriter effect immediately
    typeWriter();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [setLocation, fullText]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`text-center transition-all duration-1500 ease-out ${
        isBlurring ? 'blur-sm opacity-0 scale-95' : 'blur-0 opacity-100 scale-100'
      }`}>
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold leading-tight" style={{ fontFamily: 'Instrument Serif, serif' }}>
          <span className="text-white">{displayText}</span>
          {displayText.length < fullText.length && (
            <span className="text-white animate-pulse">|</span>
          )}
        </h1>
      </div>
    </div>
  );
}