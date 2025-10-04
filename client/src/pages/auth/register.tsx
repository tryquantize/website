/* File Overview
  Path: client/src/pages/auth/register.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { handleIndependentGoogleAuth } from "@/lib/independent-google-auth";
import { Bot, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";
import LoginPage from "@/components/ui/gaming-login";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Register schema
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms & Conditions" }),
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  // Removed Firebase auth to avoid conflicts
  const [isLogin, setIsLogin] = useState(false); // false = Create Account, true = Sign In
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      agree: false as any, // Type assertion to fix the literal type issue
    }
  });

  // Login mutation
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

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormData, "confirmPassword">) => {
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

  const onLoginSubmit = async (data: LoginFormData) => {
    setError("");
    // Use existing auth system only
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setError("");
    // Use existing auth system only
    registerMutation.mutate(data);
  };

  // Removed complex Google auth handler

  const passwordStrength = {
    hasMinLength: registerForm.watch("password")?.length >= 8,
    hasLowercase: /[a-z]/.test(registerForm.watch("password") || ""),
    hasUppercase: /[A-Z]/.test(registerForm.watch("password") || ""),
    hasNumber: /\d/.test(registerForm.watch("password") || "")
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    // Reset forms when switching
    if (isLogin) {
      registerForm.reset();
    } else {
      loginForm.reset();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <LoginPage.VideoBackground videoUrl="https://videos.pexels.com/video-files/8128311/8128311-uhd_2560_1440_25fps.mp4" />
      
      {/* Back to website link */}
      <Link href="/" className="absolute top-4 right-4 z-30 text-white/90 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1 text-sm">
        Back to website →
      </Link>

      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10">
          {/* Toggle between Login and Register */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/10 rounded-lg p-1 flex">
              <button
                onClick={toggleMode}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  !isLogin 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                onClick={toggleMode}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  isLogin 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {isLogin ? (
            /* Login Form with Gaming Style */
            <>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 relative group">
                  <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                  <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                    Quantize
                  </span>
                  <span className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                </h2>
                <p className="text-white/80 flex flex-col items-center space-y-1">
                  <span className="relative group cursor-default">
                    <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative inline-block animate-pulse">Your AI universe awaits</span>
                  </span>
                  <span className="text-xs text-white/50 animate-pulse">
                    [Press Enter to join the adventure]
                  </span>
                  <div className="flex space-x-2 text-xs text-white/40">
                    <span className="animate-pulse">🤖</span>
                    <span className="animate-bounce">⚡</span>
                    <span className="animate-pulse">🚀</span>
                  </div>
                </p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive" data-testid="login-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="text-white/60" size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...loginForm.register("email")}
                    required
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="text-white/60" size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...loginForm.register("password")}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative inline-block w-10 h-5 cursor-pointer">
                      <input
                        type="checkbox"
                        id="remember-me"
                        className="sr-only"
                        checked={false}
                        onChange={() => {}}
                      />
                      <div className="absolute inset-0 rounded-full transition-colors duration-200 ease-in-out bg-white/20">
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out" />
                      </div>
                    </div>
                    <label htmlFor="remember-me" className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-black font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-white/20 hover:shadow-white/40"
                >
                  {loginMutation.isPending ? 'Logging in...' : 'Enter Quantize'}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-white/10 absolute w-full"></div>
                  <div className="bg-transparent px-4 relative text-white/60 text-sm">
                    quick access via
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button 
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
                    onClick={handleIndependentGoogleAuth}
                  >
                    <FcGoogle size={20} />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Register Form with Gaming Style */
            <>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 relative group">
                  <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                  <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                    Join Quantize
                  </span>
                  <span className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                </h2>
                <p className="text-white/80 flex flex-col items-center space-y-1">
                  <span className="relative group cursor-default">
                    <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative inline-block animate-pulse">Create your AI adventure</span>
                  </span>
                  <span className="text-xs text-white/50 animate-pulse">
                    [Begin your journey with us]
                  </span>
                  <div className="flex space-x-2 text-xs text-white/40">
                    <span className="animate-pulse">✨</span>
                    <span className="animate-bounce">🚀</span>
                    <span className="animate-pulse">🌟</span>
                  </div>
                </p>
              </div>

              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive" data-testid="register-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First name"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                      {...registerForm.register("firstName")}
                      required
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last name"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                      {...registerForm.register("lastName")}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="text-white/60" size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...registerForm.register("email")}
                    required
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="text-white/60" size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-500/50 transition-colors"
                    {...registerForm.register("password")}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {registerForm.watch("password") && (
                    <div className="space-y-1 mt-2">
                      <div className="text-xs text-white/60">Password requirements:</div>
                      <div className="space-y-1">
                        <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-white/60'}`}>
                          <CheckCircle className={`w-3 h-3 ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-white/60'}`} />
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasLowercase ? 'text-green-500' : 'text-white/60'}`}>
                          <CheckCircle className={`w-3 h-3 ${passwordStrength.hasLowercase ? 'text-green-500' : 'text-white/60'}`} />
                          <span>One lowercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasUppercase ? 'text-green-500' : 'text-white/60'}`}>
                          <CheckCircle className={`w-3 h-3 ${passwordStrength.hasUppercase ? 'text-green-500' : 'text-white/60'}`} />
                          <span>One uppercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasNumber ? 'text-green-500' : 'text-white/60'}`}>
                          <CheckCircle className={`w-3 h-3 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-white/60'}`} />
                          <span>One number</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-3 py-2">
                  <Checkbox 
                    id="agree" 
                    checked={registerForm.watch("agree")} 
                    onCheckedChange={(val) => registerForm.setValue("agree", val as true)} 
                  />
                  <label htmlFor="agree" className="text-sm text-white/80 leading-tight">
                    I agree to the <a href="#" className="underline">Terms & Conditions</a>
                  </label>
                </div>
                {registerForm.formState.errors.agree && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.agree.message as string}</p>
                )}

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-black font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-white/20 hover:shadow-white/40"
                >
                  {registerMutation.isPending ? 'Creating account...' : 'Join Quantize'}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-white/10 absolute w-full"></div>
                  <div className="bg-transparent px-4 relative text-white/60 text-sm">
                    quick access via
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button 
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
                    onClick={handleIndependentGoogleAuth}
                  >
                    <FcGoogle size={20} />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
        © 2025 Quantize. All rights reserved.
      </footer>
    </div>
  );
}