import { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import AIPredictionsPage from './pages/AIPredictionsPage';
import CompliancePage from './pages/CompliancePage';
import VulnerabilitiesPage from './pages/VulnerabilitiesPage';
import GuardrailsPage from './pages/GuardrailsPage';
import RemediationPage from './pages/RemediationPage';
import AccountsPage from './pages/AccountsPage';
import SecurityPage from './pages/SecurityPage';
import FinOpsPage from './pages/FinOpsPage';
import IntegrationsPage from './pages/IntegrationsPage';

type PageType = 'ai' | 'dashboard' | 'compliance' | 'vulnerabilities' | 'guardrails' | 'remediation' | 'accounts' | 'security' | 'finops' | 'integrations';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems: { id: PageType; label: string; icon: string }[] = [
    { id: 'ai', label: 'AI Predictions', icon: '🔮' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'compliance', label: 'Compliance', icon: '🎯' },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: '🔬' },
    { id: 'guardrails', label: 'Guardrails', icon: '🚧' },
    { id: 'remediation', label: 'Remediation', icon: '🤖' },
    { id: 'accounts', label: 'Accounts', icon: '🔄' },
    { id: 'security', label: 'Security', icon: '🔍' },
    { id: 'finops', label: 'FinOps', icon: '💰' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'ai': return <AIPredictionsPage />;
      case 'dashboard': return <DashboardPage />;
      case 'compliance': return <CompliancePage />;
      case 'vulnerabilities': return <VulnerabilitiesPage />;
      case 'guardrails': return <GuardrailsPage />;
      case 'remediation': return <RemediationPage />;
      case 'accounts': return <AccountsPage />;
      case 'security': return <SecurityPage />;
      case 'finops': return <FinOpsPage />;
      case 'integrations': return <IntegrationsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☁️</span>
            {sidebarOpen && <span className="font-bold text-lg">Cloud Compliance</span>}
          </div>
        </div>
        
        <nav className="flex-1 p-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                currentPage === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? '◀ Collapse' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
