import { useState, useEffect } from 'react';
import { fetchDashboard, fetchHealth } from '../services/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboardData, healthData] = await Promise.all([
        fetchDashboard(),
        fetchHealth()
      ]);
      setDashboard(dashboardData);
      setHealth(healthData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            health?.mode === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {health?.mode === 'live' ? '🔴 Live' : '🟡 Demo'}
          </span>
          <span className="text-sm text-gray-500">v{health?.version}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">Total Accounts</div>
              <div className="text-3xl font-bold text-indigo-600">{dashboard?.accounts?.total || 0}</div>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">Current Month Cost</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(dashboard?.costs?.current_month || 0)}
              </div>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">Forecast</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(dashboard?.costs?.forecast || 0)}
              </div>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">Potential Savings</div>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(dashboard?.costs?.savings_potential || 0)}
              </div>
            </div>
            <div className="text-4xl">💡</div>
          </div>
        </div>
      </div>

      {/* Security Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Security Findings by Severity</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{dashboard?.security?.CRITICAL || 0}</div>
              <div className="text-sm text-gray-500">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{dashboard?.security?.HIGH || 0}</div>
              <div className="text-sm text-gray-500">High</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{dashboard?.security?.MEDIUM || 0}</div>
              <div className="text-sm text-gray-500">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dashboard?.security?.LOW || 0}</div>
              <div className="text-sm text-gray-500">Low</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>AWS Connection</span>
              <span className={`px-2 py-1 rounded text-sm ${
                health?.aws_connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {health?.aws_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>AWS Account</span>
              <span className="font-mono text-sm">{health?.aws_account}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Region</span>
              <span>{health?.aws_region}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Endpoints</span>
              <span>{health?.endpoints}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Feature Parity</span>
              <span className="text-green-600 font-medium">{health?.feature_parity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Loaded Modules</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {health?.modules_loaded && Object.entries(health.modules_loaded).map(([module, loaded]) => (
            <div key={module} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${loaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">{module.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
