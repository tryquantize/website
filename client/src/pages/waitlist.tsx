import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setWaitlistCount(prev => prev + 1);
      toast({
        title: "Welcome to the waitlist! 🎉",
        description: "You've been added to our exclusive early access list. We'll notify you when we launch!",
      });
      setEmail("");
    }, 1000);
  };



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
              <Clock className="h-4 w-4 mr-2" />
              Coming Soon
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Instrument Serif, serif' }}>
              Good things come to those who wait.
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto" style={{ fontFamily: 'Instrument Serif, serif' }}>
              Lightning Fast AI-powered Automations and Workflows for every business, Coming Soon!
            </p>

            {/* Waitlist Form */}
            <Card className="max-w-md mx-auto bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm font-medium">
                      Join the waitlist
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/10"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Waitlist Counter */}
            <div className="mt-12 mb-8">
              <div className="text-6xl font-bold text-white mb-2" style={{ fontFamily: 'Instrument Serif, serif' }}>
                {waitlistCount}
              </div>
              <div className="text-xl text-white/70">
                people have joined the waitlist
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 