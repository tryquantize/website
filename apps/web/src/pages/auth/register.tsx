import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { FirebaseAuthService } from "@/lib/firebase-auth";
import { handleIndependentGoogleAuth } from "@/lib/independent-google-auth";
import { Eye, EyeOff, AlertCircle, Mail, Lock, User, Check } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { OptimizedRaycastBackground } from "@/components/ui/raycast-animated-background";
import { motion, AnimatePresence } from "framer-motion";

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

// Custom styles for autofill override
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.15) inset !important;
    -webkit-text-fill-color: #ffffff !important;
    caret-color: #ffffff !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

// Animation variants for smooth slide transitions
const slideVariants = {
  enterFromRight: {
    x: 40,
    opacity: 0,
  },
  enterFromLeft: {
    x: -40,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exitToLeft: {
    x: -40,
    opacity: 0,
  },
  exitToRight: {
    x: 40,
    opacity: 0,
  },
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formHeight, setFormHeight] = useState<number | "auto">("auto");
  const loginFormRef = useRef<HTMLDivElement>(null);
  const registerFormRef = useRef<HTMLDivElement>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", agree: false as any }
  });

  // Measure form heights for smooth transition
  useEffect(() => {
    const measureHeight = () => {
      if (isLogin && loginFormRef.current) {
        setFormHeight(loginFormRef.current.scrollHeight);
      } else if (!isLogin && registerFormRef.current) {
        setFormHeight(registerFormRef.current.scrollHeight);
      }
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(measureHeight, 50);
    return () => clearTimeout(timer);
  }, [isLogin]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Use Firebase Auth directly instead of API call
      const result = await FirebaseAuthService.signIn(data.email, data.password);
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      return result;
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
      const fullName = `${data.firstName}${data.lastName ? ` ${data.lastName}` : ""}`.trim();
      // Use Firebase Auth directly instead of API call
      const result = await FirebaseAuthService.signUp(data.email, data.password, fullName);
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      return result;
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

  const toggleMode = (mode: boolean) => {
    if (mode === isLogin) return;
    setIsLogin(mode);
    setError("");
    loginForm.reset();
    registerForm.reset();
  };

  // Check if agree is checked
  const isAgreed = registerForm.watch("agree");

  // Shared input styles for better visibility
  const inputStyles = "w-full pl-11 pr-4 py-3.5 bg-white/15 border border-white/20 rounded-xl text-white text-base placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all duration-200";

  const iconStyles = "absolute left-4 top-1/2 -translate-y-1/2 text-white/60";

  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      {/* Inject autofill override styles */}
      <style dangerouslySetInnerHTML={{ __html: autofillStyles }} />

      {/* Background - Using Optimized Raycast */}
      <div className="fixed inset-0 w-full h-full z-0">
        <OptimizedRaycastBackground />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Main Card - NO layout animation on the blurred container */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">

            {/* Toggle Tabs */}
            <div className="flex items-center justify-center mb-10">
              <div className="bg-white/10 rounded-full p-1.5 flex w-full max-w-xs relative">
                {/* Animated background pill */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-lg"
                  initial={false}
                  animate={{
                    left: isLogin ? "50%" : "6px",
                    right: isLogin ? "6px" : "50%",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button
                  onClick={() => toggleMode(false)}
                  className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 relative z-10 ${!isLogin ? 'text-black' : 'text-white/70 hover:text-white'
                    }`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => toggleMode(true)}
                  className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 relative z-10 ${isLogin ? 'text-black' : 'text-white/70 hover:text-white'
                    }`}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Form Container with animated height */}
            <motion.div
              className="overflow-hidden"
              initial={false}
              animate={{ height: formHeight }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
              {/* Form Content with Slide Animation */}
              <AnimatePresence mode="wait" initial={false}>
                {isLogin ? (
                  <motion.div
                    key="login"
                    ref={loginFormRef}
                    initial="enterFromRight"
                    animate="center"
                    exit="exitToLeft"
                    variants={slideVariants}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      mass: 0.8
                    }}
                  >
                    {/* Login Header */}
                    <div className="mb-8 text-center">
                      <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Welcome Back</h1>
                      <p className="text-white/60 text-base">Sign in to continue your AI journey</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                      {error && (
                        <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Email Input */}
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Mail className={iconStyles} size={20} />
                          <input
                            type="email"
                            placeholder="Email address"
                            className={inputStyles}
                            autoComplete="email"
                            {...loginForm.register("email")}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-400 pl-1">{loginForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Lock className={iconStyles} size={20} />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={`${inputStyles} pr-12`}
                            autoComplete="current-password"
                            {...loginForm.register("password")}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-400 pl-1">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-2"
                      >
                        {loginMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Signing in...
                          </span>
                        ) : 'Sign In'}
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-white/40 text-sm">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>

                    {/* Google Sign In */}
                    <Button
                      className="w-full h-12 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all duration-300"
                      onClick={handleIndependentGoogleAuth}
                    >
                      <FcGoogle size={22} />
                      <span>Continue with Google</span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    ref={registerFormRef}
                    initial="enterFromLeft"
                    animate="center"
                    exit="exitToRight"
                    variants={slideVariants}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      mass: 0.8
                    }}
                  >
                    {/* Register Header */}
                    <div className="mb-8 text-center">
                      <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Join Quantize</h1>
                      <p className="text-white/60 text-base">Start your AI discovery journey</p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                      {error && (
                        <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="relative">
                            <User className={iconStyles} size={20} />
                            <input
                              type="text"
                              placeholder="First name"
                              className={inputStyles}
                              autoComplete="given-name"
                              {...registerForm.register("firstName")}
                            />
                          </div>
                          {registerForm.formState.errors.firstName && (
                            <p className="text-xs text-red-400 pl-1">{registerForm.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Last name"
                            className="w-full px-4 py-3.5 bg-white/15 border border-white/20 rounded-xl text-white text-base placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all duration-200"
                            autoComplete="family-name"
                            {...registerForm.register("lastName")}
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Mail className={iconStyles} size={20} />
                          <input
                            type="email"
                            placeholder="Email address"
                            className={inputStyles}
                            autoComplete="email"
                            {...registerForm.register("email")}
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-400 pl-1">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Lock className={iconStyles} size={20} />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={`${inputStyles} pr-12`}
                            autoComplete="new-password"
                            {...registerForm.register("password")}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-400 pl-1">{registerForm.formState.errors.password.message}</p>
                        )}
                        <p className="text-xs text-white/40 pl-1">Min 8 characters with uppercase, lowercase & number</p>
                      </div>

                      {/* Simple Terms Checkbox - Clean inline design */}
                      <div className="space-y-1.5">
                        <label
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => registerForm.setValue("agree", !isAgreed as true)}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isAgreed
                                ? 'bg-[#0071e3] border-[#0071e3]'
                                : 'border-white/40 group-hover:border-white/60'
                              }`}
                          >
                            {isAgreed && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                            I agree to the{' '}
                            <a
                              href="#"
                              className="text-[#0071e3] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Terms & Conditions
                            </a>
                          </span>
                        </label>
                        {registerForm.formState.errors.agree && (
                          <p className="text-sm text-red-400 pl-8">{registerForm.formState.errors.agree.message}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-2"
                      >
                        {registerMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating account...
                          </span>
                        ) : 'Create Account'}
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-white/40 text-sm">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>

                    {/* Google Sign Up */}
                    <Button
                      className="w-full h-12 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all duration-300"
                      onClick={handleIndependentGoogleAuth}
                    >
                      <FcGoogle size={22} />
                      <span>Continue with Google</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-white/40 text-sm mt-6">
            By continuing, you agree to Quantize's Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  );
}