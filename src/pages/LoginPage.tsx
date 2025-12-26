import { useMsal } from '@azure/msal-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Cloud, Lock, LogIn } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

export default function LoginPage() {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const { setAuthenticated, setUser, setDemoMode } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAzureLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await instance.loginPopup(loginRequest);
      
      if (response.account) {
        setUser({
          id: response.account.localAccountId || 'azure-user',
          name: response.account.name || 'User',
          email: response.account.username,
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          lastLogin: new Date().toISOString(),
        });
        setAuthenticated(true);
        setDemoMode(false);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    setUser({
      id: 'demo-user-001',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      lastLogin: new Date().toISOString(),
    });
    setAuthenticated(true);
    setDemoMode(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Cloud Compliance Canvas</h1>
          <p className="text-slate-400">Enterprise AWS Governance Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <Cloud className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleAzureLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Sign in with Microsoft
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoMode}
            className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Continue in Demo Mode
          </button>

          <p className="text-center text-xs text-slate-400 mt-6">
            Demo mode uses sample data. Sign in with Microsoft for live AWS data.
          </p>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Managing 640+ AWS Accounts | Security | Compliance | FinOps
        </p>
      </div>
    </div>
  );
}
