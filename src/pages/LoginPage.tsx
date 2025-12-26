import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAppStore } from '../stores/appStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { setAuthenticated, setUser, setDemoMode } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setDemoMode(true);
    setAuthenticated(true);
    setUser({
      id: 'demo-user',
      email: 'admin@example.com',
      name: 'Demo Admin',
      role: 'admin',
      permissions: ['all'],
      lastLogin: new Date().toISOString(),
    });
    navigate('/dashboard');
  };

  const handleAzureLogin = async () => {
    try {
      setLoading(true);
      await instance.loginPopup({
        scopes: ['User.Read'],
      });
      setAuthenticated(true);
      setDemoMode(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232F3E] to-[#37475A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">☁️</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Cloud Compliance Canvas</h1>
          <p className="text-gray-500 mt-2">Enterprise AWS Governance Platform</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleAzureLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0078D4] text-white rounded-lg hover:bg-[#106EBE] transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21" fill="currentColor">
              <path d="M0 0h10v10H0V0zm11 0h10v10H11V0zM0 11h10v10H0V11zm11 0h10v10H11V11z" />
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Azure AD'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#FF9900] text-[#FF9900] rounded-lg hover:bg-[#FF9900] hover:text-white transition-colors"
          >
            <span>📊</span>
            Continue with Demo Mode
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Enterprise Edition v6.0 | AWS re:Invent 2025 Ready
        </p>
      </div>
    </div>
  );
}
