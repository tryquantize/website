/* File Overview
  Path: client/src/pages/waitlist.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState as useReactState } from "react";
import {
  Clock,
  ArrowRight,
  User,
  Mail,
  CheckCircle2,
  Sparkles,
  Shield,
  Sun,
  Moon,
  Phone,
  Star,
  Zap,
  Users,
  Eye,
  Search,
  Brain,
  Target,
  Rocket,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WaitlistService } from "@/lib/waitlist-service";
import { useTheme } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import WarpDriveShader from "@/components/ui/warp-drive-shader";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export default function WaitlistPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 14, hours: 23, minutes: 2, seconds: 33, milliseconds: 1 });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [searchTerm, setSearchTerm] = useReactState("");
  
  const countryCodes = [
    { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
    { code: "+355", country: "Albania", flag: "🇦🇱" },
    { code: "+213", country: "Algeria", flag: "🇩🇿" },
    { code: "+1", country: "United States", flag: "🇺🇸" },
    { code: "+376", country: "Andorra", flag: "🇦🇩" },
    { code: "+244", country: "Angola", flag: "🇦🇴" },
    { code: "+54", country: "Argentina", flag: "🇦🇷" },
    { code: "+374", country: "Armenia", flag: "🇦🇲" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+43", country: "Austria", flag: "🇦🇹" },
    { code: "+994", country: "Azerbaijan", flag: "🇦🇿" },
    { code: "+973", country: "Bahrain", flag: "🇧🇭" },
    { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
    { code: "+32", country: "Belgium", flag: "🇧🇪" },
    { code: "+55", country: "Brazil", flag: "🇧🇷" },
    { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
    { code: "+1", country: "Canada", flag: "🇨🇦" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+57", country: "Colombia", flag: "🇨🇴" },
    { code: "+45", country: "Denmark", flag: "🇩🇰" },
    { code: "+20", country: "Egypt", flag: "🇪🇬" },
    { code: "+358", country: "Finland", flag: "🇫🇮" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+30", country: "Greece", flag: "🇬🇷" },
    { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+62", country: "Indonesia", flag: "🇮🇩" },
    { code: "+98", country: "Iran", flag: "🇮🇷" },
    { code: "+964", country: "Iraq", flag: "🇮🇶" },
    { code: "+353", country: "Ireland", flag: "🇮🇪" },
    { code: "+972", country: "Israel", flag: "🇮🇱" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+962", country: "Jordan", flag: "🇯🇴" },
    { code: "+7", country: "Kazakhstan", flag: "🇰🇿" },
    { code: "+254", country: "Kenya", flag: "🇰🇪" },
    { code: "+965", country: "Kuwait", flag: "🇰🇼" },
    { code: "+60", country: "Malaysia", flag: "🇲🇾" },
    { code: "+52", country: "Mexico", flag: "🇲🇽" },
    { code: "+31", country: "Netherlands", flag: "🇳🇱" },
    { code: "+64", country: "New Zealand", flag: "🇳🇿" },
    { code: "+234", country: "Nigeria", flag: "🇳🇬" },
    { code: "+47", country: "Norway", flag: "🇳🇴" },
    { code: "+92", country: "Pakistan", flag: "🇵🇰" },
    { code: "+63", country: "Philippines", flag: "🇵🇭" },
    { code: "+48", country: "Poland", flag: "🇵🇱" },
    { code: "+351", country: "Portugal", flag: "🇵🇹" },
    { code: "+974", country: "Qatar", flag: "🇶🇦" },
    { code: "+7", country: "Russia", flag: "🇷🇺" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
    { code: "+27", country: "South Africa", flag: "🇿🇦" },
    { code: "+82", country: "South Korea", flag: "🇰🇷" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
    { code: "+46", country: "Sweden", flag: "🇸🇪" },
    { code: "+41", country: "Switzerland", flag: "🇨🇭" },
    { code: "+66", country: "Thailand", flag: "🇹🇭" },
    { code: "+90", country: "Turkey", flag: "🇹🇷" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+380", country: "Ukraine", flag: "🇺🇦" },
    { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  ];
  
  const filteredCountries = countryCodes.filter(country => 
    country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Pleasant guitar sound effect function
  const playGuitarSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 3; // 3 seconds
      
      // Create oscillators for guitar-like sound with harmonics
      const fundamental = audioContext.createOscillator();
      const harmonic2 = audioContext.createOscillator();
      const harmonic3 = audioContext.createOscillator();
      const harmonic4 = audioContext.createOscillator();
      
      // Create gain nodes for volume control
      const gain1 = audioContext.createGain();
      const gain2 = audioContext.createGain();
      const gain3 = audioContext.createGain();
      const gain4 = audioContext.createGain();
      const masterGain = audioContext.createGain();
      
      // Configure oscillators for guitar-like tones (G major chord)
      fundamental.type = 'sawtooth'; // Guitar-like timbre
      fundamental.frequency.setValueAtTime(196.00, audioContext.currentTime); // G3
      
      harmonic2.type = 'sawtooth';
      harmonic2.frequency.setValueAtTime(246.94, audioContext.currentTime); // B3
      
      harmonic3.type = 'triangle';
      harmonic3.frequency.setValueAtTime(293.66, audioContext.currentTime); // D4
      
      harmonic4.type = 'sine';
      harmonic4.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
      
      // Set up guitar-like ADSR envelope
      // Attack (quick pluck)
      gain1.gain.setValueAtTime(0, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.3);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      gain2.gain.setValueAtTime(0, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      gain3.gain.setValueAtTime(0, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
      gain3.gain.exponentialRampToValueAtTime(0.06, audioContext.currentTime + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      gain4.gain.setValueAtTime(0, audioContext.currentTime);
      gain4.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gain4.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.3);
      gain4.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      masterGain.gain.setValueAtTime(0.5, audioContext.currentTime);
      
      // Connect audio nodes
      fundamental.connect(gain1);
      harmonic2.connect(gain2);
      harmonic3.connect(gain3);
      harmonic4.connect(gain4);
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      gain3.connect(masterGain);
      gain4.connect(masterGain);
      masterGain.connect(audioContext.destination);
      
      // Start and stop oscillators
      fundamental.start(audioContext.currentTime);
      harmonic2.start(audioContext.currentTime);
      harmonic3.start(audioContext.currentTime);
      harmonic4.start(audioContext.currentTime);
      fundamental.stop(audioContext.currentTime + duration);
      harmonic2.stop(audioContext.currentTime + duration);
      harmonic3.stop(audioContext.currentTime + duration);
      harmonic4.stop(audioContext.currentTime + duration);
      
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14); // 14 days from now
    targetDate.setHours(23, 2, 33, 1); // Set to specific time

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((distance % 1000) / 10); // Show centiseconds

        setCountdown({ days, hours, minutes, seconds, milliseconds });
      }
    }, 10); // Update every 10ms for smooth milliseconds

    return () => clearInterval(timer);
  }, []);

  // Load waitlist count from Firebase with initial value of 100
  useEffect(() => {
    const loadWaitlistCount = async () => {
      const count = await WaitlistService.getWaitlistCount();
      console.log('Initial waitlist count:', count);
      setWaitlistCount(count);
    };
    
    loadWaitlistCount();
    
    // Listen for real-time updates
    const unsubscribe = WaitlistService.onWaitlistCountChange((count) => {
      console.log('Waitlist count updated:', count);
      setWaitlistCount(count);
    });
    
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);

    try {
      const result = await WaitlistService.addToWaitlist(
        name,
        email,
        whatsappNumber ? `${countryCode}${whatsappNumber}` : undefined
      );

      if (result.success) {
        playGuitarSound();
        
        // Manually update counter immediately
        const newCount = await WaitlistService.getWaitlistCount();
        setWaitlistCount(newCount);
        
        toast({
          title: "Welcome to the waitlist! 🎉",
          description: `Thanks, ${name.split(" ")[0] || "there"}. You're #${result.position} on the waitlist! We'll notify you at ${email}!`,
        });
        
        setName("");
        setEmail("");
        setWhatsappNumber("");
      } else {
        toast({
          title: "Oops! Something went wrong",
          description: result.error || "Failed to join waitlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen relative">
      <WarpDriveShader />
      <Header />
      {/* Theme Toggle Button - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 px-0 bg-white/10 hover:bg-white/20 border border-white/20"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-4 pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 sm:mb-6 inline-flex items-center justify-center bg-white text-black border border-gray-200 rounded-full px-2 sm:px-4 py-1 sm:py-2 min-w-[280px] sm:min-w-[400px] h-6 sm:h-8">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                Coming in {countdown.days}D {countdown.hours}H {countdown.minutes}M {countdown.seconds}S
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              When we're live, you won't miss Google, you'll wonder why you ever used it.
            </h1>

            <p
              className="text-sm sm:text-lg md:text-2xl lg:text-3xl mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent px-2"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              Where your questions meet the world's smartest solutions.
            </p>

            <Card className="max-w-xl mx-auto bg-black/30 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <Label className="text-white text-sm font-medium">Join the waitlist</Label>

                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/10"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 z-10" />
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-32 pl-10 bg-white/5 border-white/20 text-white focus:border-white/40 focus:bg-white/10">
                              <SelectValue>
                                {countryCodes.find(c => c.code === countryCode)?.flag} {countryCode}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700 text-white max-h-60">
                              <div className="p-2">
                                <Input
                                  placeholder="Search countries..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                                />
                              </div>
                              {filteredCountries.map((item) => (
                                <SelectItem 
                                  key={`${item.code}-${item.country}`} 
                                  value={item.code}
                                  className="hover:bg-gray-800 focus:bg-gray-800 text-white"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{item.flag}</span>
                                    <span className="font-medium">{item.code}</span>
                                    <span className="text-gray-300">{item.country}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="WhatsApp number (optional)"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !email || !name}
                    className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Join the waitlist <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-xs text-white/60">
                    <div className="inline-flex items-center gap-2">
                      <Shield className="h-4 w-4" /> No spam. Unsubscribe anytime.
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <Sparkles className="h-4 w-4" /> Early access perks inside
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>





            <div className="mt-12 mb-12">
              <div
                className="text-6xl font-bold text-white mb-2"
                style={{ fontFamily: "Instrument Serif, serif" }}
              >
                {waitlistCount}
              </div>
              <div className="text-xl text-white/70">people have joined the waitlist</div>
            </div>


            



          </div>
        </div>
      </div>
    </div>
  );
} 