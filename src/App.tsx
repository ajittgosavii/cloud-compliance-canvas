import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Shield, DollarSign, CheckCircle, Brain,
  Wrench, Bug, Users, Link2, Menu, X, ChevronLeft, ChevronRight,
  Lock, ShieldAlert, Cloud, CloudOff, ToggleLeft, ToggleRight,
  Settings, LogOut, User
} from 'lucide-react';
import * as api from './services/api';

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

interface AppConfig {
  demo_mode: boolean;
  aws_connected: boolean;
  aws_account: string;
  aws_region: string;
  claude_configured: boolean;
  organizations_enabled: boolean;
}

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
  const [config, setConfig] = useState<AppConfig>({
    demo_mode: true,
    aws_connected: false,
    aws_account: '',
    aws_region: 'us-east-1',
    claude_configured: false,
    organizations_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.fetchConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    setLoading(false);
  };

  const toggleDemoMode = async () => {
    try {
      const newMode = !config.demo_mode;
      await api.setDemoMode(newMode);
      setConfig(prev => ({ ...prev, demo_mode: newMode }));
    } catch (error) {
      console.error('Failed to toggle mode:', error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage demoMode={config.demo_mode} />;
      case 'ai': return <AIPredictionsPage demoMode={config.demo_mode} />;
      case 'security': return <SecurityPage demoMode={config.demo_mode} />;
      case 'compliance': return <CompliancePage demoMode={config.demo_mode} />;
      case 'vulnerabilities': return <VulnerabilitiesPage demoMode={config.demo_mode} />;
      case 'guardrails': return <GuardrailsPage demoMode={config.demo_mode} />;
      case 'remediation': return <RemediationPage demoMode={config.demo_mode} />;
      case 'accounts': return <AccountsPage demoMode={config.demo_mode} />;
      case 'finops': return <FinOpsPage demoMode={config.demo_mode} />;
      case 'integrations': return <IntegrationsPage demoMode={config.demo_mode} />;
      default: return <DashboardPage demoMode={config.demo_mode} />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading Cloud Compliance Canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <span className="text-white font-bold text-lg">Cloud Canvas</span>
                <span className="text-xs text-gray-500 block">Enterprise v4.0</span>
              </div>
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

        {/* AWS Connection Status */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="space-y-3">
              {/* Demo/Live Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Mode</span>
                <button
                  onClick={toggleDemoMode}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    config.demo_mode 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}
                >
                  {config.demo_mode ? (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Demo
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      Live
                    </>
                  )}
                </button>
              </div>

              {/* AWS Connection */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">AWS</span>
                <div className={`flex items-center gap-2 text-sm ${
                  config.aws_connected ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {config.aws_connected ? (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-4 h-4" />
                      <span>Not Connected</span>
                    </>
                  )}
                </div>
              </div>

              {/* AWS Account Info */}
              {config.aws_connected && config.aws_account && (
                <div className="text-xs text-gray-500 bg-gray-700/50 rounded p-2">
                  <div>Account: {config.aws_account}</div>
                  <div>Region: {config.aws_region}</div>
                  {config.organizations_enabled && (
                    <div className="text-green-400 mt-1">✓ Organizations Enabled</div>
                  )}
                </div>
              )}

              {/* Claude AI Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Claude AI</span>
                <span className={`text-sm ${config.claude_configured ? 'text-green-400' : 'text-gray-500'}`}>
                  {config.claude_configured ? '✓ Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mode Indicator (collapsed) */}
        {sidebarCollapsed && (
          <div className="p-2 border-b border-gray-700 flex justify-center">
            <div className={`w-3 h-3 rounded-full ${config.demo_mode ? 'bg-yellow-400' : 'bg-green-400'}`} 
                 title={config.demo_mode ? 'Demo Mode' : 'Live Mode'} />
          </div>
        )}

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
            <div className="space-y-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <div className="text-gray-500 text-xs pt-2 border-t border-gray-700">
                <p>Cloud Compliance Canvas</p>
                <p>v4.0.0 Enterprise</p>
              </div>
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-800 border-r border-gray-700 transform transition-transform md:hidden ${
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

        {/* Mobile Mode Toggle */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={toggleDemoMode}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
              config.demo_mode 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}
          >
            {config.demo_mode ? (
              <>
                <ToggleLeft className="w-5 h-5" />
                Demo Mode
              </>
            ) : (
              <>
                <ToggleRight className="w-5 h-5" />
                Live Mode (AWS)
              </>
            )}
          </button>
          
          {config.aws_connected && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Connected: {config.aws_account}
            </div>
          )}
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
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
            {/* Mode Badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              config.demo_mode 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {config.demo_mode ? '📊 Demo Data' : '🔴 Live AWS Data'}
            </div>

            {/* AWS Status */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${config.aws_connected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
              <span className="text-gray-400">
                {config.aws_connected ? `AWS ${config.aws_region}` : 'AWS Disconnected'}
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Demo Mode Banner */}
        {config.demo_mode && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <span>📊</span>
              <span><strong>Demo Mode:</strong> Showing sample data. Toggle to Live Mode to connect to your AWS accounts.</span>
            </div>
            <button
              onClick={toggleDemoMode}
              className="text-yellow-400 hover:text-yellow-300 text-sm underline"
            >
              Switch to Live
            </button>
          </div>
        )}

        {/* Not Connected Warning (Live Mode) */}
        {!config.demo_mode && !config.aws_connected && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <CloudOff className="w-4 h-4" />
              <span><strong>AWS Not Connected:</strong> Configure AWS credentials or switch to Demo Mode.</span>
            </div>
            <button
              onClick={toggleDemoMode}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              Use Demo Mode
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {renderPage()}
        </main>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Demo/Live Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Data Mode</p>
                  <p className="text-gray-400 text-sm">Switch between demo and live AWS data</p>
                </div>
                <button
                  onClick={toggleDemoMode}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    config.demo_mode 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {config.demo_mode ? 'Demo' : 'Live'}
                </button>
              </div>

              {/* AWS Status */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-white font-medium mb-2">AWS Connection</p>
                {config.aws_connected ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Cloud className="w-4 h-4" />
                      <span>Connected</span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Account: {config.aws_account}</p>
                      <p>Region: {config.aws_region}</p>
                      <p>Organizations: {config.organizations_enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">
                      AWS credentials not configured. Set environment variables in Lambda:
                    </p>
                    <ul className="text-gray-500 text-xs mt-2 space-y-1">
                      <li>• AWS_ACCESS_KEY_ID</li>
                      <li>• AWS_SECRET_ACCESS_KEY</li>
                      <li>• AWS_DEFAULT_REGION</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Claude AI Status */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-white font-medium mb-2">Claude AI</p>
                <div className={`rounded-lg p-3 ${config.claude_configured ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600'}`}>
                  <p className={config.claude_configured ? 'text-green-400' : 'text-gray-400'}>
                    {config.claude_configured ? '✓ API Key Configured' : 'Not Configured'}
                  </p>
                  {!config.claude_configured && (
                    <p className="text-gray-500 text-sm mt-1">
                      Set ANTHROPIC_API_KEY in Lambda environment variables
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
