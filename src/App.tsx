import React, { useState } from 'react';
import { 
  LayoutDashboard, Shield, DollarSign, CheckCircle, Brain,
  Wrench, Bug, Users, Link2, Menu, X, ChevronLeft, ChevronRight,
  Lock, ShieldAlert, LogOut
} from 'lucide-react';

// Pages
import DashboardPage from './pages/DashboardPage';
import SecurityPage from './pages/SecurityPage';
import CompliancePage from './pages/CompliancePage';
import VulnerabilitiesPage from './pages/VulnerabilitiesPage';
import GuardrailsPage from './pages/GuardrailsPage';
import RemediationPage from './pages/RemediationPage';
import AccountsPage from './pages/AccountsPage';
import FinOpsPage from './pages/FinOpsPage';
import AIPredictionsPage from './pages/AIPredictionsPage';
import IntegrationsPage from './pages/IntegrationsPage';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
  { id: 'ai', label: 'AI Command Center', icon: Brain, color: 'purple' },
  { id: 'security', label: 'Security', icon: ShieldAlert, color: 'blue' },
  { id: 'compliance', label: 'Compliance', icon: CheckCircle, color: 'green' },
  { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Bug, color: 'red' },
  { id: 'guardrails', label: 'Tech Guardrails', icon: Lock, color: 'blue' },
  { id: 'remediation', label: 'Remediation', icon: Wrench, color: 'orange' },
  { id: 'accounts', label: 'Account Lifecycle', icon: Users, color: 'cyan' },
  { id: 'finops', label: 'FinOps', icon: DollarSign, color: 'emerald' },
  { id: 'integrations', label: 'Integrations', icon: Link2, color: 'indigo' }
];

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'ai': return <AIPredictionsPage />;
      case 'security': return <SecurityPage />;
      case 'compliance': return <CompliancePage />;
      case 'vulnerabilities': return <VulnerabilitiesPage />;
      case 'guardrails': return <GuardrailsPage />;
      case 'remediation': return <RemediationPage />;
      case 'accounts': return <AccountsPage />;
      case 'finops': return <FinOpsPage />;
      case 'integrations': return <IntegrationsPage />;
      default: return <DashboardPage />;
    }
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      green: 'text-green-400',
      red: 'text-red-400',
      orange: 'text-orange-400',
      cyan: 'text-cyan-400',
      emerald: 'text-emerald-400',
      indigo: 'text-indigo-400'
    };
    return colors[color] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <span className="text-white font-bold text-lg">Cloud Canvas</span>
            </div>
          )}
          {sidebarCollapsed && <Shield className="w-8 h-8 text-blue-400 mx-auto" />}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 text-gray-400 hover:text-white"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 ${currentPage === item.id ? getIconColor(item.color) : ''}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!sidebarCollapsed && (
            <div className="text-gray-500 text-xs">
              <p>Cloud Compliance Canvas</p>
              <p>v3.0.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-white font-bold text-lg">Cloud Canvas</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentPage === item.id ? getIconColor(item.color) : ''}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-white font-semibold capitalize">
              {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">Connected to AWS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
