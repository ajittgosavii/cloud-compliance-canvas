import { useQuery } from '@tanstack/react-query';
import Plot from 'react-plotly.js';
import { 
  Shield, 
  AlertTriangle, 
  Bug, 
  DollarSign, 
  TrendingUp, 
  Users,
  Activity,
  Clock
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { MetricsGrid, SeverityMetricCard, ComplianceScoreCard } from '../components/common/MetricCard';
import { fetchDashboardData } from '../services/api';
import type { DashboardMetric, SecurityHubData } from '../types';

export default function DashboardPage() {
  const { demoMode, overallComplianceScore } = useAppStore();

  // Fetch dashboard data with React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', demoMode],
    queryFn: () => fetchDashboardData(demoMode),
    staleTime: 30000, // 30 seconds
  });

  // Demo data fallback
  const dashboardData = data || getDemoData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading dashboard: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Executive Dashboard</h1>
          <p className="text-gray-500">Real-time overview of your AWS security and compliance posture</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Compliance Score Card - Large */}
      <div className="bg-gradient-to-r from-[#232F3E] to-[#37475A] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <ComplianceScoreCard score={overallComplianceScore} size="lg" />
            <div>
              <h2 className="text-2xl font-bold">Overall Security Posture</h2>
              <p className="text-gray-300 mt-1">
                Based on Security Hub, GuardDuty, Config, and Inspector findings
              </p>
              <div className="flex gap-4 mt-4">
                <StatusBadge label="Security Hub" enabled />
                <StatusBadge label="GuardDuty" enabled />
                <StatusBadge label="Config" enabled />
                <StatusBadge label="Inspector" enabled />
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Trend (30 days)</p>
            <div className="flex items-center gap-2 text-green-400 text-lg font-semibold">
              <TrendingUp size={20} />
              +5.2%
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <MetricsGrid metrics={dashboardData.keyMetrics} columns={5} />

      {/* Security Findings by Severity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔍 Security Findings by Severity
        </h3>
        <div className="grid grid-cols-5 gap-4">
          <SeverityMetricCard severity="CRITICAL" count={dashboardData.findings.critical} change={-3} />
          <SeverityMetricCard severity="HIGH" count={dashboardData.findings.high} change={-7} />
          <SeverityMetricCard severity="MEDIUM" count={dashboardData.findings.medium} change={2} />
          <SeverityMetricCard severity="LOW" count={dashboardData.findings.low} change={0} />
          <SeverityMetricCard severity="INFORMATIONAL" count={dashboardData.findings.informational} change={0} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Findings Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📈 Findings Trend (Last 30 Days)
          </h3>
          <Plot
            data={[
              {
                x: dashboardData.trendData.dates,
                y: dashboardData.trendData.critical,
                name: 'Critical',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#DC2626', width: 2 },
              },
              {
                x: dashboardData.trendData.dates,
                y: dashboardData.trendData.high,
                name: 'High',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#EA580C', width: 2 },
              },
              {
                x: dashboardData.trendData.dates,
                y: dashboardData.trendData.medium,
                name: 'Medium',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#CA8A04', width: 2 },
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 20, r: 20, b: 40, l: 40 },
              legend: { orientation: 'h', y: -0.15 },
              xaxis: { tickformat: '%b %d' },
              yaxis: { title: { text: 'Count' } },
            }}
            useResizeHandler
            style={{ width: '100%', height: 300 }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>

        {/* Compliance by Framework */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Compliance by Framework
          </h3>
          <Plot
            data={[
              {
                values: dashboardData.complianceFrameworks.map((f: any) => f.score),
                labels: dashboardData.complianceFrameworks.map((f: any) => f.name),
                type: 'pie',
                hole: 0.5,
                marker: {
                  colors: ['#16A34A', '#2563EB', '#CA8A04', '#7C3AED', '#DC2626'],
                },
                textinfo: 'label+percent',
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 20, r: 20, b: 20, l: 20 },
              showlegend: false,
            }}
            useResizeHandler
            style={{ width: '100%', height: 300 }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>
      </div>

      {/* Recent Activity & Top Issues */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Critical Issues */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Recent Critical Issues
          </h3>
          <div className="space-y-3">
            {dashboardData.recentCriticalIssues.map((issue: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{issue.title}</p>
                  <p className="text-sm text-gray-500">{issue.account} • {issue.region}</p>
                </div>
                <span className="text-xs text-gray-400">{issue.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="text-green-500" size={20} />
            Cost Overview (MTD)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Current Month</span>
              <span className="text-2xl font-bold text-gray-900">
                ${dashboardData.costData.currentMonth.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Forecasted</span>
              <span className="text-lg font-semibold text-gray-700">
                ${dashboardData.costData.forecasted.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Budget</span>
              <span className="text-lg font-semibold text-gray-700">
                ${dashboardData.costData.budget.toLocaleString()}
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Budget Utilization</span>
                <span className="text-sm font-medium">
                  {Math.round((dashboardData.costData.currentMonth / dashboardData.costData.budget) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                  style={{ 
                    width: `${Math.min((dashboardData.costData.currentMonth / dashboardData.costData.budget) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="text-blue-500" size={20} />
          AWS Accounts Summary
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {dashboardData.accountSummary.map((account: any, index: number) => (
            <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{account.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  account.status === 'Healthy' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {account.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{account.id}</p>
              <p className="text-sm text-gray-400 mt-1">{account.findings} findings</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
      enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
    }`}>
      <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
      {label}
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// Demo Data Generator (mirrors Streamlit demo data)
function getDemoData() {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  return {
    keyMetrics: [
      { id: '1', title: 'Total Findings', value: '1,247', change: -12, changeDirection: 'down' as const, color: '#FF9900' },
      { id: '2', title: 'Critical Issues', value: '23', change: -3, changeDirection: 'down' as const, color: '#DC2626' },
      { id: '3', title: 'Compliance Score', value: '87%', change: 5, changeDirection: 'up' as const, color: '#16A34A' },
      { id: '4', title: 'AWS Accounts', value: '48', change: 0, changeDirection: 'stable' as const, color: '#2563EB' },
      { id: '5', title: 'MTD Cost', value: '$127.4K', change: 8, changeDirection: 'up' as const, color: '#7C3AED' },
    ] as DashboardMetric[],
    findings: {
      critical: 23,
      high: 89,
      medium: 312,
      low: 567,
      informational: 256,
    },
    trendData: {
      dates,
      critical: dates.map(() => Math.floor(Math.random() * 10) + 20),
      high: dates.map(() => Math.floor(Math.random() * 30) + 80),
      medium: dates.map(() => Math.floor(Math.random() * 50) + 300),
    },
    complianceFrameworks: [
      { name: 'AWS Foundational', score: 92 },
      { name: 'CIS AWS', score: 87 },
      { name: 'PCI-DSS', score: 78 },
      { name: 'SOC 2', score: 85 },
      { name: 'HIPAA', score: 81 },
    ],
    recentCriticalIssues: [
      { title: 'S3 Bucket Public Access', account: 'Production-Retail', region: 'us-east-1', time: '5m ago' },
      { title: 'Root Account MFA Disabled', account: 'Dev-Healthcare', region: 'us-west-2', time: '12m ago' },
      { title: 'Security Group Allows 0.0.0.0/0', account: 'Staging-Financial', region: 'eu-west-1', time: '28m ago' },
    ],
    costData: {
      currentMonth: 127400,
      forecasted: 185000,
      budget: 200000,
    },
    accountSummary: [
      { id: '123456789012', name: 'Production-Retail', status: 'Healthy', findings: 156 },
      { id: '123456789013', name: 'Dev-Healthcare', status: 'Warning', findings: 287 },
      { id: '123456789014', name: 'Staging-Financial', status: 'Healthy', findings: 98 },
      { id: '123456789015', name: 'Sandbox-Research', status: 'Healthy', findings: 45 },
    ],
  };
}
