import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { handleIndependentGoogleAuth } from "@/lib/independent-google-auth";
import { Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Component as RaycastBackground } from "@/components/ui/raycast-animated-background";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  agree: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Conditions" }) }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", agree: false as any }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      setLocation("/home");
    },
    onError: (error: any) => {
      setError(error.message || "Login failed. Please check your credentials.");
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = {
        name: `${data.firstName}${data.lastName ? ` ${data.lastName}` : ""}`.trim(),
        email: data.email,
        password: data.password,
        role: "client" as const,
      };
      const response = await apiRequest("POST", "/api/auth/register", payload);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      setLocation("/home");
    },
    onError: (error: any) => {
      setError(error.message || "Registration failed. Please try again.");
    }
  });

  const onLoginSubmit = (data: LoginFormData) => {
    setError("");
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    setError("");
    registerMutation.mutate(data);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      <div className="fixed inset-0 w-full h-full z-0">
        <RaycastBackground />
      </div>

      <div className="relative z-20 flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/10 rounded-lg p-1 flex">
              <button
                onClick={toggleMode}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  !isLogin ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                onClick={toggleMode}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  isLogin ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {isLogin ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 text-white">Quantize</h2>
                <p className="text-white/80">Your AI universe awaits</p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-400 mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium"
                >
                  {loginMutation.isPending ? 'Logging in...' : 'Enter Quantize'}
                </Button>
              </form>

              <div className="mt-6">
                <Button 
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700" 
                  onClick={handleIndependentGoogleAuth}
                >
                  <FcGoogle size={20} />
                  <span>Sign in with Google</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 text-white">Join Quantize</h2>
                <p className="text-white/80">Create your AI adventure</p>
              </div>

              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...registerForm.register("firstName")}
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...registerForm.register("lastName")}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...registerForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-400 mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="agree" 
                    checked={registerForm.watch("agree")} 
                    onCheckedChange={(val) => registerForm.setValue("agree", val as true)}
                    className="square"
                  />
                  <label htmlFor="agree" className="text-sm text-white/80">
                    I agree to the <a href="#" className="underline">Terms & Conditions</a>
                  </label>
                </div>
                {registerForm.formState.errors.agree && (
                  <p className="text-sm text-red-400">{registerForm.formState.errors.agree.message}</p>
                )}

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium"
                >
                  {registerMutation.isPending ? 'Creating account...' : 'Join Quantize'}
                </Button>
              </form>

              <div className="mt-6">
                <Button 
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700" 
                  onClick={handleIndependentGoogleAuth}
                >
                  <FcGoogle size={20} />
                  <span>Sign up with Google</span>
                </Button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}