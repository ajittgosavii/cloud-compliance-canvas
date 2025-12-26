import { Routes, Route, Navigate } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

import Layout from './components/common/Layout';
import DashboardPage from './pages/DashboardPage';
import CompliancePage from './pages/CompliancePage';
import SecurityPage from './pages/SecurityPage';
import VulnerabilitiesPage from './pages/VulnerabilitiesPage';
import GuardrailsPage from './pages/GuardrailsPage';
import RemediationPage from './pages/RemediationPage';
import AccountsPage from './pages/AccountsPage';
import FinOpsPage from './pages/FinOpsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AIPredictionsPage from './pages/AIPredictionsPage';
import LoginPage from './pages/LoginPage';
import { useAppStore } from './stores/appStore';

// Azure AD MSAL Configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'demo-client-id',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage' as const,
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, demoMode } = useAppStore();
  
  // In demo mode or if authenticated, allow access
  if (demoMode || authenticated) {
    return <>{children}</>;
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Main Navigation - Matches Streamlit Tabs */}
          <Route path="ai-predictions" element={<AIPredictionsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="vulnerabilities" element={<VulnerabilitiesPage />} />
          <Route path="guardrails" element={<GuardrailsPage />} />
          <Route path="remediation" element={<RemediationPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="finops" element={<FinOpsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
        </Route>
        
        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MsalProvider>
  );
}

export default App;
