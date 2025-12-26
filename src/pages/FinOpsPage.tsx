import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Plot from 'react-plotly.js';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Brain
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { MetricsGrid } from '../components/common/MetricCard';
import type { DashboardMetric } from '../types';

export default function FinOpsPage() {
  const { demoMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Sub-tabs matching Streamlit FinOps tabs
  const tabs = [
    { id: 'overview', label: '📊 Cost Overview', icon: PieChart },
    { id: 'services', label: '🔧 By Service', icon: BarChart3 },
    { id: 'accounts', label: '👥 By Account', icon: DollarSign },
    { id: 'anomalies', label: '⚠️ Anomalies', icon: AlertTriangle },
    { id: 'savings', label: '💡 Savings', icon: Lightbulb },
    { id: 'budgets', label: '📅 Budgets', icon: Calendar },
    { id: 'ai-analysis', label: '🧠 AI Analysis', icon: Brain },
  ];

  // Demo data
  const costData = getDemoCostData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 FinOps Dashboard</h1>
          <p className="text-gray-500">AWS Cost Management & Optimization Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download size={16} />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] text-white rounded-lg hover:bg-[#E88B00]">
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <MetricsGrid metrics={costData.keyMetrics} columns={5} />

      {/* Sub-navigation Tabs */}
      <div className="bg-[#232F3E] rounded-xl p-1 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#FF9900] text-white'
                  : 'text-gray-300 hover:bg-[#37475A]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'overview' && <CostOverviewTab data={costData} />}
        {activeTab === 'services' && <CostByServiceTab data={costData} />}
        {activeTab === 'accounts' && <CostByAccountTab data={costData} />}
        {activeTab === 'anomalies' && <CostAnomaliesTab data={costData} />}
        {activeTab === 'savings' && <SavingsRecommendationsTab data={costData} />}
        {activeTab === 'budgets' && <BudgetTrackingTab data={costData} />}
        {activeTab === 'ai-analysis' && <AIAnalysisTab data={costData} />}
      </div>
    </div>
  );
}

// Cost Overview Tab
function CostOverviewTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">📊 Cost Overview</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Spend Trend */}
        <div>
          <h4 className="text-md font-medium mb-4">Daily Spend (Last 30 Days)</h4>
          <Plot
            data={[
              {
                x: data.dailyCosts.map((d: any) => d.date),
                y: data.dailyCosts.map((d: any) => d.amount),
                type: 'scatter',
                mode: 'lines+markers',
                fill: 'tozeroy',
                line: { color: '#FF9900', width: 2 },
                marker: { size: 4 },
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 20, r: 20, b: 40, l: 60 },
              xaxis: { tickformat: '%b %d' },
              yaxis: { title: { text: 'Cost (\$)' }, tickformat: ',.0f' },
            }}
            useResizeHandler
            style={{ width: '100%', height: 300 }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>

        {/* Cost by Service Pie */}
        <div>
          <h4 className="text-md font-medium mb-4">Cost Distribution by Service</h4>
          <Plot
            data={[
              {
                values: data.serviceBreakdown.map((s: any) => s.cost),
                labels: data.serviceBreakdown.map((s: any) => s.service),
                type: 'pie',
                hole: 0.4,
                marker: {
                  colors: ['#FF9900', '#146EB4', '#232F3E', '#00A8E1', '#5B9BD5', '#7C3AED'],
                },
                textinfo: 'label+percent',
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 20, r: 20, b: 20, l: 20 },
              showlegend: true,
              legend: { orientation: 'v', x: 1.1, y: 0.5 },
            }}
            useResizeHandler
            style={{ width: '100%', height: 300 }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>
      </div>

      {/* Month over Month Comparison */}
      <div>
        <h4 className="text-md font-medium mb-4">Month-over-Month Comparison</h4>
        <Plot
          data={[
            {
              x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              y: data.monthlyTrend.previous,
              name: '2024',
              type: 'bar',
              marker: { color: '#94A3B8' },
            },
            {
              x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              y: data.monthlyTrend.current,
              name: '2025',
              type: 'bar',
              marker: { color: '#FF9900' },
            },
          ]}
          layout={{
            autosize: true,
            margin: { t: 40, r: 20, b: 40, l: 60 },
            barmode: 'group',
            legend: { orientation: 'h', y: 1.15 },
            yaxis: { title: { text: 'Cost (\$)' }, tickformat: ',.0f' },
          }}
          useResizeHandler
          style={{ width: '100%', height: 300 }}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>
    </div>
  );
}

// Cost by Service Tab
function CostByServiceTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">🔧 Cost by AWS Service</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Service</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">MTD Cost</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">% of Total</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Change</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.serviceBreakdown.map((service: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{service.service}</td>
                <td className="px-4 py-3 text-right">${service.cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{service.percentage}%</td>
                <td className={`px-4 py-3 text-right ${service.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {service.change > 0 ? '+' : ''}{service.change}%
                </td>
                <td className="px-4 py-3">
                  <div className="w-24 h-8">
                    <Plot
                      data={[{
                        y: service.trend,
                        type: 'scatter',
                        mode: 'lines',
                        line: { color: service.change > 0 ? '#DC2626' : '#16A34A', width: 2 },
                      }]}
                      layout={{
                        autosize: true,
                        margin: { t: 0, r: 0, b: 0, l: 0 },
                        xaxis: { visible: false },
                        yaxis: { visible: false },
                      }}
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false, staticPlot: true }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Cost by Account Tab
function CostByAccountTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">👥 Cost by AWS Account</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {data.accountCosts.map((account: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{account.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                account.environment === 'production' ? 'bg-red-100 text-red-700' :
                account.environment === 'staging' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {account.environment}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{account.accountId}</p>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">${account.cost.toLocaleString()}</span>
              <span className={`text-sm ${account.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {account.change > 0 ? '↑' : '↓'} {Math.abs(account.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cost Anomalies Tab
function CostAnomaliesTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">⚠️ Cost Anomalies</h3>
      
      <div className="space-y-4">
        {data.anomalies.map((anomaly: any, index: number) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            anomaly.impact > 1000 ? 'border-red-500 bg-red-50' :
            anomaly.impact > 500 ? 'border-yellow-500 bg-yellow-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{anomaly.service}</h4>
                <p className="text-sm text-gray-600">{anomaly.account} • {anomaly.region}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">+${anomaly.impact.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{anomaly.impactPercentage}% above expected</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-700">{anomaly.rootCause}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Savings Recommendations Tab
function SavingsRecommendationsTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">💡 Savings Recommendations</h3>
      
      <div className="grid gap-4">
        {data.savings.map((rec: any, index: number) => (
          <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    rec.type === 'SAVINGS_PLAN' ? 'bg-green-100 text-green-700' :
                    rec.type === 'RESERVED_INSTANCE' ? 'bg-blue-100 text-blue-700' :
                    rec.type === 'RIGHTSIZING' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {rec.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    rec.impact === 'HIGH' ? 'bg-red-100 text-red-700' :
                    rec.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.impact} Impact
                  </span>
                </div>
                <h4 className="font-semibold">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-green-600">${rec.monthlySavings.toLocaleString()}/mo</p>
                <p className="text-sm text-gray-500">${rec.annualSavings.toLocaleString()}/yr</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1.5 bg-[#FF9900] text-white rounded-lg text-sm hover:bg-[#E88B00]">
                Apply Now
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Budget Tracking Tab
function BudgetTrackingTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">📅 Budget Tracking</h3>
      
      <div className="grid gap-4">
        {data.budgets.map((budget: any, index: number) => (
          <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{budget.name}</h4>
                <p className="text-sm text-gray-500">{budget.period}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                budget.percentUsed > 90 ? 'bg-red-100 text-red-700' :
                budget.percentUsed > 75 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {budget.percentUsed}% Used
              </span>
            </div>
            
            <div className="flex justify-between text-sm mb-2">
              <span>Spent: ${budget.spent.toLocaleString()}</span>
              <span>Budget: ${budget.amount.toLocaleString()}</span>
            </div>
            
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  budget.percentUsed > 90 ? 'bg-red-500' :
                  budget.percentUsed > 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
              />
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Forecasted: ${budget.forecasted.toLocaleString()} ({budget.forecastPercent}% of budget)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Analysis Tab
function AIAnalysisTab({ data }: { data: any }) {
  const [query, setQuery] = useState('');
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">🧠 AI Cost Analysis (Claude)</h3>
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-purple-600" size={24} />
          <span className="font-semibold text-purple-900">Ask Claude about your AWS costs</span>
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are my top cost optimization opportunities?"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Analyze
          </button>
        </div>
        
        <div className="mt-4 flex gap-2 flex-wrap">
          {['Top savings opportunities', 'Cost anomaly analysis', 'Reserved Instance recommendations', 'Budget forecast'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">📊 AI-Generated Insights</h4>
        <div className="space-y-4 text-gray-700">
          <p>Based on your AWS cost data, here are key insights:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Top Opportunity:</strong> Purchasing a 1-year Compute Savings Plan could save approximately $12,500/month (15% of EC2 spend).</li>
            <li><strong>Anomaly Detected:</strong> RDS costs increased 47% this month due to new Aurora cluster provisioning.</li>
            <li><strong>Rightsizing:</strong> 23 EC2 instances are over-provisioned and can be downsized for $4,200/month savings.</li>
            <li><strong>Idle Resources:</strong> 5 load balancers and 12 EBS volumes appear unused.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Demo Data Generator
function getDemoCostData() {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  return {
    keyMetrics: [
      { id: '1', title: 'MTD Cost', value: '$127,432', change: 8.5, changeDirection: 'up' as const, color: '#FF9900' },
      { id: '2', title: 'Forecasted', value: '$185,000', change: 12, changeDirection: 'up' as const, color: '#2563EB' },
      { id: '3', title: 'Budget', value: '$200,000', unit: 'remaining: $72.5K', color: '#16A34A' },
      { id: '4', title: 'Savings Identified', value: '$24,500', changeLabel: '/month potential', color: '#7C3AED' },
      { id: '5', title: 'Anomalies', value: '3', change: -2, changeDirection: 'down' as const, color: '#DC2626' },
    ] as DashboardMetric[],
    dailyCosts: dates.map((date) => ({
      date,
      amount: 4000 + Math.random() * 2000,
    })),
    serviceBreakdown: [
      { service: 'Amazon EC2', cost: 45000, percentage: 35, change: 5, trend: [40, 42, 44, 43, 45, 45] },
      { service: 'Amazon RDS', cost: 28000, percentage: 22, change: 12, trend: [22, 24, 25, 26, 27, 28] },
      { service: 'Amazon S3', cost: 18000, percentage: 14, change: -3, trend: [20, 19, 19, 18, 18, 18] },
      { service: 'AWS Lambda', cost: 12000, percentage: 9, change: 8, trend: [10, 10, 11, 11, 12, 12] },
      { service: 'Amazon EKS', cost: 15000, percentage: 12, change: 15, trend: [11, 12, 13, 14, 14, 15] },
      { service: 'Other', cost: 9432, percentage: 8, change: 2, trend: [9, 9, 9, 9, 9, 9] },
    ],
    monthlyTrend: {
      previous: [95, 98, 102, 105, 108, 112, 115, 118, 120, 122, 125, 127],
      current: [105, 108, 112, 118, 122, 127, 0, 0, 0, 0, 0, 0],
    },
    accountCosts: [
      { accountId: '123456789012', name: 'Production-Retail', environment: 'production', cost: 65000, change: 8 },
      { accountId: '123456789013', name: 'Dev-Healthcare', environment: 'development', cost: 28000, change: -5 },
      { accountId: '123456789014', name: 'Staging-Financial', environment: 'staging', cost: 22000, change: 12 },
      { accountId: '123456789015', name: 'Sandbox-Research', environment: 'development', cost: 12432, change: 3 },
    ],
    anomalies: [
      { service: 'Amazon RDS', account: 'Production-Retail', region: 'us-east-1', impact: 2500, impactPercentage: 47, rootCause: 'New Aurora cluster provisioned without cost approval' },
      { service: 'AWS Lambda', account: 'Dev-Healthcare', region: 'us-west-2', impact: 800, impactPercentage: 32, rootCause: 'Recursive function invocations detected' },
      { service: 'Amazon EC2', account: 'Sandbox-Research', region: 'eu-west-1', impact: 450, impactPercentage: 18, rootCause: 'GPU instances left running over weekend' },
    ],
    savings: [
      { type: 'SAVINGS_PLAN', title: 'Compute Savings Plan', description: '1-year commitment for EC2, Lambda, and Fargate', monthlySavings: 12500, annualSavings: 150000, impact: 'HIGH' },
      { type: 'RESERVED_INSTANCE', title: 'RDS Reserved Instances', description: 'Reserve r5.2xlarge instances for production databases', monthlySavings: 5200, annualSavings: 62400, impact: 'MEDIUM' },
      { type: 'RIGHTSIZING', title: 'EC2 Rightsizing', description: '23 instances identified as over-provisioned', monthlySavings: 4200, annualSavings: 50400, impact: 'MEDIUM' },
      { type: 'IDLE_RESOURCE', title: 'Idle Resource Cleanup', description: '5 ELBs and 12 EBS volumes with no traffic', monthlySavings: 2600, annualSavings: 31200, impact: 'LOW' },
    ],
    budgets: [
      { name: 'Overall AWS Budget', period: 'Monthly', amount: 200000, spent: 127432, forecasted: 185000, percentUsed: 64, forecastPercent: 92 },
      { name: 'Production Account', period: 'Monthly', amount: 80000, spent: 65000, forecasted: 95000, percentUsed: 81, forecastPercent: 119 },
      { name: 'AI/ML Workloads', period: 'Monthly', amount: 25000, spent: 18500, forecasted: 28000, percentUsed: 74, forecastPercent: 112 },
    ],
  };
}
