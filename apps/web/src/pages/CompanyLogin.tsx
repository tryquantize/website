import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Lock, Eye, EyeOff } from 'lucide-react';

export function CompanyLogin() {
  const [match, params] = useRoute('/company-login/:companyId');
  const [, setLocation] = useLocation();
  const companyId = params?.companyId;
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For now, use a simple password check
      // In production, this should be a proper authentication system
      const validPassword = `${companyId}_admin_2025`;
      
      if (password === validPassword) {
        // Store company authentication
        localStorage.setItem(`companyAuth_${companyId}`, 'true');
        
        // Redirect to company dashboard
        setLocation(`/admindashboard/${companyId}`);
      } else {
        setError('Invalid password. Please contact support for access.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Company Dashboard</h1>
            <p className="text-gray-300">
              Login to access {companyId} dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company ID
              </label>
              <Input
                value={companyId || ''}
                disabled
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter company password"
                  className="bg-gray-800 border-gray-600 text-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Login to Dashboard
                </>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Need access? Contact support at{' '}
              <a href="mailto:support@quantize.site" className="text-blue-400 hover:underline">
                support@quantize.site
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}