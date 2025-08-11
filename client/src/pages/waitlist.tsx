import { useState } from "react";
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
  Clock,
  ArrowRight,
  User,
  Mail,
  CheckCircle2,
  Sparkles,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WaitlistPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setWaitlistCount((prev) => prev + 1);
      const position = Math.floor(Math.random() * 200) + 1;
      toast({
        title: "Welcome to the waitlist! 🎉",
        description:
          `Thanks, ${name.split(" ")[0] || "there"}. You're early — provisional spot #${position}. We'll notify you at ${email}!`,
      });
      setName("");
      setEmail("");
    }, 900);
  };



  return (
    <div className="min-h-screen relative">
      {/* Realistic galaxy background layers */}
      <div className="galaxy-stars" />
      <div className="galaxy-stars-2" />
      <div className="galaxy-band" />
      <div className="galaxy-vignette" />

      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center justify-center bg-white/10 text-white border-white/20"
            >
              <Clock className="h-4 w-4 mr-2" /> Coming Soon
            </Badge>

            <h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              Good things come to those who wait.
            </h1>

            <p
              className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-left">
                <div className="flex items-center gap-2 text-white mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Personalized results
                </div>
                <p className="text-white/70 text-sm">
                  Receive tailored recommendations based on your goals and context.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-left">
                <div className="flex items-center gap-2 text-white mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Lightning-fast answers
                </div>
                <p className="text-white/70 text-sm">
                  Get high-signal insights in seconds with a streamlined, focused UI.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-left">
                <div className="flex items-center gap-2 text-white mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Built for teams
                </div>
                <p className="text-white/70 text-sm">
                  Share, collaborate, and turn answers into action for your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 