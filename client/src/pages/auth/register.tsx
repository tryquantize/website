import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Bot, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
  role: z.enum(["client", "startup"], {
    required_error: "Please select your role"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "client"
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormData, "confirmPassword">) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      setLocation(data.user.role === "startup" ? "/dashboard" : "/");
    },
    onError: (error: any) => {
      setError(error.message || "Registration failed. Please try again.");
    }
  });

  const onSubmit = (data: RegisterFormData) => {
    setError("");
    const { confirmPassword, ...submitData } = data;
    registerMutation.mutate(submitData);
  };

  const passwordStrength = {
    hasMinLength: form.watch("password")?.length >= 8,
    hasLowercase: /[a-z]/.test(form.watch("password") || ""),
    hasUppercase: /[A-Z]/.test(form.watch("password") || ""),
    hasNumber: /\d/.test(form.watch("password") || "")
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Join AI Discovery and start exploring innovative tools
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="register-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...form.register("name")}
                  data-testid="name-input"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...form.register("email")}
                  data-testid="email-input"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select 
                  value={form.watch("role")}
                  onValueChange={(value) => form.setValue("role", value as "client" | "startup")}
                >
                  <SelectTrigger data-testid="role-select">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">
                      <div>
                        <div className="font-medium">Business Client</div>
                        <div className="text-sm text-muted-foreground">Looking for AI tools</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="startup">
                      <div>
                        <div className="font-medium">AI Startup</div>
                        <div className="text-sm text-muted-foreground">Want to list your AI tool</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...form.register("password")}
                    data-testid="password-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {form.watch("password") && (
                  <div className="space-y-1 mt-2">
                    <div className="text-xs text-muted-foreground">Password requirements:</div>
                    <div className="space-y-1">
                      <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className={`w-3 h-3 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className={`w-3 h-3 ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className={`w-3 h-3 ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className={`w-3 h-3 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span>One number</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...form.register("confirmPassword")}
                    data-testid="confirm-password-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="toggle-confirm-password-visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="register-submit-button"
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline" data-testid="login-link">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary" data-testid="back-home-link">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
