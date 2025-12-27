import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, RefreshCw, Shield, DollarSign, CheckCircle, 
  AlertTriangle, TrendingUp, Activity, Users, Bug
} from 'lucide-react';
import * as api from '../services/api';

interface DashboardPageProps {
  demoMode?: boolean;
}

export default function DashboardPage({ demoMode = true }: DashboardPageProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'operational': return 'bg-green-400';
      case 'degraded': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Cloud Compliance Canvas Overview</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-400/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-gray-400">Compliance Score</span>
          </div>
          <p className={`text-4xl font-bold ${getScoreColor(dashboardData?.compliance?.score || 0)}`}>
            {dashboardData?.compliance?.score || 0}%
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-400/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-gray-400">Critical Findings</span>
          </div>
          <p className="text-4xl font-bold text-red-400">
            {dashboardData?.security?.critical || 0}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-400/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-gray-400">Monthly Spend</span>
          </div>
          <p className="text-4xl font-bold text-emerald-400">
            {formatCurrency(dashboardData?.costs?.current_month || 0)}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-400/10 rounded-lg">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-gray-400">AWS Accounts</span>
          </div>
          <p className="text-4xl font-bold text-cyan-400">
            {dashboardData?.accounts?.total || 0}
          </p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Security Findings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{dashboardData?.security?.critical || 0}</p>
              <p className="text-gray-400 text-sm">Critical</p>
            </div>
            <div className="bg-orange-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{dashboardData?.security?.high || 0}</p>
              <p className="text-gray-400 text-sm">High</p>
            </div>
            <div className="bg-yellow-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{dashboardData?.security?.medium || 0}</p>
              <p className="text-gray-400 text-sm">Medium</p>
            </div>
            <div className="bg-blue-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{dashboardData?.security?.low || 0}</p>
              <p className="text-gray-400 text-sm">Low</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Bug className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Vulnerabilities</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{dashboardData?.vulnerabilities?.critical || 0}</p>
              <p className="text-gray-400 text-sm">Critical</p>
            </div>
            <div className="bg-orange-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{dashboardData?.vulnerabilities?.high || 0}</p>
              <p className="text-gray-400 text-sm">High</p>
            </div>
            <div className="bg-yellow-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{dashboardData?.vulnerabilities?.medium || 0}</p>
              <p className="text-gray-400 text-sm">Medium</p>
            </div>
            <div className="bg-blue-400/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{dashboardData?.vulnerabilities?.low || 0}</p>
              <p className="text-gray-400 text-sm">Low</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Compliance Frameworks</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {dashboardData?.compliance?.frameworks?.map((fw: any) => (
            <div key={fw.name} className="bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-2">{fw.name}</p>
              <p className={`text-2xl font-bold ${getScoreColor(fw.score)}`}>{fw.score}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Service Status</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dashboardData?.services?.map((service: any) => (
            <div key={service.name} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></div>
              <div>
                <p className="text-white text-sm">{service.name}</p>
                <p className="text-gray-500 text-xs capitalize">{service.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Overview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Cost Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Current Month</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(dashboardData?.costs?.current_month || 0)}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Last Month</p>
            <p className="text-2xl font-bold text-gray-400">{formatCurrency(dashboardData?.costs?.last_month || 0)}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Forecasted</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(dashboardData?.costs?.forecasted || 0)}</p>
          </div>
          <div className="bg-emerald-400/10 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Potential Savings</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(dashboardData?.costs?.savings_potential || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
