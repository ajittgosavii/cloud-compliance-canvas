import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  ShieldAlert,
  Bug,
  Fence,
  Bot,
  Users,
  Search,
  DollarSign,
  Link2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Settings,
  LogOut,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { clsx } from 'clsx';

// Navigation items matching Streamlit tabs
const navigationItems = [
  { path: '/ai-predictions', label: 'AI Predictions', icon: Sparkles, badge: 'NEW' },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/compliance', label: 'Compliance', icon: Shield },
  { path: '/vulnerabilities', label: 'Vulnerabilities', icon: Bug },
  { path: '/guardrails', label: 'Guardrails', icon: Fence },
  { path: '/remediation', label: 'Remediation', icon: Bot },
  { path: '/accounts', label: 'Accounts', icon: Users },
  { path: '/security', label: 'Security', icon: Search },
  { path: '/finops', label: 'FinOps', icon: DollarSign },
  { path: '/integrations', label: 'Integrations', icon: Link2 },
];

export default function Layout() {
  const location = useLocation();
  const { 
    demoMode, 
    setDemoMode, 
    awsConnected, 
    user, 
    overallComplianceScore,
    sidebarCollapsed,
    setSidebarCollapsed,
    logout
  } = useAppStore();
  
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={clsx('min-h-screen flex', darkMode ? 'dark bg-gray-900' : 'bg-gray-50')}>
      {/* Sidebar */}
      <aside 
        className={clsx(
          'fixed left-0 top-0 h-full transition-all duration-300 z-50',
          'bg-gradient-to-b from-[#232F3E] to-[#37475A] text-white',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">☁️</span>
              <span className="font-bold text-sm">Cloud Compliance</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-white/10',
                  isActive && 'bg-[#FF9900] text-white shadow-lg'
                )}
              >
                <Icon size={20} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Mode Toggle */}
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className={clsx(
            'flex items-center gap-2 p-2 rounded-lg',
            demoMode ? 'bg-blue-500/20' : 'bg-green-500/20'
          )}>
            {!sidebarCollapsed && (
              <span className="text-xs flex-1">
                {demoMode ? '📊 Demo Mode' : '🔴 Live Mode'}
              </span>
            )}
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-colors',
                demoMode ? 'bg-blue-500' : 'bg-green-500'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  demoMode ? 'left-1' : 'left-7'
                )}
              />
            </button>
          </div>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF9900] flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Demo User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role || 'Admin'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx(
        'flex-1 transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-6">
          {/* Page Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              ☁️ Cloud Compliance Canvas
            </h1>
            <p className="text-xs text-gray-500">Enterprise AWS Governance Platform v6.0</p>
          </div>

          {/* Mode Banner */}
          <div className={clsx(
            'px-4 py-1.5 rounded-full text-sm font-medium',
            demoMode 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          )}>
            {demoMode ? '📊 Demo Mode - Sample Data' : '🔴 Live Mode - Real AWS Data'}
          </div>

          {/* Compliance Score */}
          <div className="flex items-center gap-2">
            <div className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center font-bold text-white',
              overallComplianceScore >= 90 ? 'bg-green-500' :
              overallComplianceScore >= 70 ? 'bg-yellow-500' :
              overallComplianceScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
            )}>
              {overallComplianceScore}%
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700">Compliance</p>
              <p className="text-gray-500">Score</p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* AWS Connection Status */}
            <div className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
              awsConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            )}>
              <div className={clsx(
                'w-2 h-2 rounded-full',
                awsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              )} />
              {awsConnected ? 'AWS Connected' : 'Not Connected'}
            </div>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Help */}
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <HelpCircle size={20} className="text-gray-600" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Settings size={20} className="text-gray-600" />
            </button>

            {/* Logout */}
            <button 
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* Service Status Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-2">
          <div className="flex items-center gap-6 text-sm">
            <ServiceIndicator name="Security Hub" status={awsConnected} />
            <ServiceIndicator name="GuardDuty" status={awsConnected} />
            <ServiceIndicator name="Inspector" status={awsConnected} />
            <ServiceIndicator name="Config" status={awsConnected} />
            <ServiceIndicator name="Cost Explorer" status={awsConnected} />
            <ServiceIndicator name="Claude AI" status={true} />
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center text-sm text-gray-500">
          <p>☁️ Cloud Compliance Canvas | Enterprise Edition v6.0 | Demo/Live Mode</p>
          <p className="text-xs mt-1">
            AWS Security Hub • GuardDuty • Config • Inspector • Bedrock • GitHub GHAS • KICS • OPA
          </p>
        </footer>
      </div>
    </div>
  );
}

// Service Status Indicator Component
function ServiceIndicator({ name, status }: { name: string; status: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={clsx(
        'w-2 h-2 rounded-full',
        status ? 'bg-green-500' : 'bg-gray-300'
      )} />
      <span className={status ? 'text-gray-700' : 'text-gray-400'}>{name}</span>
    </div>
  );
}
