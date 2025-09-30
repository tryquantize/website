"use client";

/* File Overview
  Path: client/src/pages/auth/register.tsx
  Purpose: A top-level page component rendered based on the current route.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useState } from "react";
import Link from "next/link"
import { useLocation } from "@/hooks/use-location";
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
import heroImage from "@assets/image_1754838988796.png";

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
      setLocation("/dashboard");
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
      setLocation(data.user.role === "startup" ? "/dashboard" : "/welcome-transition");
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-[#252033] rounded-2xl shadow-2xl overflow-hidden">
        {/* Left visual panel */}
        <div className="relative hidden md:block">
          <img src="/forest.png" alt="Forest" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 h-full p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
            <span className="text-firequest font-semibold tracking-wide">Quantize</span>
              </div>
              <Link href="/" className="text-white/90 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1 text-sm">
                Back to website →
              </Link>
            </div>
            <div className="mt-auto pb-8">
              <div className="mt-6 flex gap-2">
                <span className="h-1 w-8 bg-white/30 rounded-full" />
                <span className="h-1 w-8 bg-white rounded-full" />
                <span className="h-1 w-8 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 md:p-10">
          <div className="max-w-md mx-auto">
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
              /* Login Form - Same section layout */
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Sign In with Email</h1>
                <p className="text-white/70 mt-2 text-center">
                  Sign in to your account to continue
                </p>

                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-8 space-y-4">
                  {error && (
                    <Alert variant="destructive" data-testid="login-error">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white/90">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="Enter your email" 
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/15"
                        autoComplete="off"
                        {...loginForm.register("email")} 
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white/90">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input 
                        id="login-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/15"
                        autoComplete="off"
                        {...loginForm.register("password")} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="text-right">
                      <a href="#" className="text-sm text-white/60 hover:text-white/80">Forgot password?</a>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-b from-neutral-800 to-black text-white hover:from-neutral-900 hover:to-black" 
                    disabled={loginMutation.isPending}
                    data-testid="login-submit-button"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={handleIndependentGoogleAuth}
                  >
                    <FcGoogle className="w-5 h-5 mr-2" /> Continue with Google
                  </Button>
                </div>
              </>
            ) : (
              /* Register Form - Same section layout */
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Create an account</h1>
                <p className="text-white/70 mt-2 text-center">
                  Join us and discover amazing AI tools
                </p>

                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="mt-8 space-y-4">
                  {error && (
                    <Alert variant="destructive" data-testid="register-error">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/90">First name</Label>
                      <Input id="firstName" placeholder="First name" autoComplete="off" {...registerForm.register("firstName")} />
                      {registerForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/90">Last name</Label>
                      <Input id="lastName" placeholder="Last name" autoComplete="off" {...registerForm.register("lastName")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white/90">Email</Label>
                    <Input id="register-email" type="email" placeholder="Enter your email" autoComplete="off" {...registerForm.register("email")} />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white/90">Enter your password</Label>
                    <div className="relative">
                      <Input id="register-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="off" {...registerForm.register("password")} />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-white/60 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
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

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-b from-neutral-800 to-black text-white hover:from-neutral-900 hover:to-black" 
                    disabled={registerMutation.isPending} 
                    data-testid="register-submit-button"
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                </form>

                <div className="mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={handleIndependentGoogleAuth}
                  >
                    <FcGoogle className="w-5 h-5 mr-2" /> Continue with Google
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
