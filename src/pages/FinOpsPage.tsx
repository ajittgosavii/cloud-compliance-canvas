import React, { useState, useEffect } from 'react';
import { 
  DollarSign, RefreshCw, TrendingUp, TrendingDown, AlertTriangle,
  PiggyBank, Leaf, BarChart3, Target, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import * as api from '../services/api';

export default function FinOpsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [unitEconomics, setUnitEconomics] = useState<any>(null);
  const [sustainability, setSustainability] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, svc, acct, bud, anom, sav, unit, sust] = await Promise.all([
        api.fetchFinOpsOverview(),
        api.fetchCostByService(),
        api.fetchCostByAccount(),
        api.fetchBudgets(),
        api.fetchCostAnomalies(),
        api.fetchSavingsRecommendations(),
        api.fetchUnitEconomics(),
        api.fetchSustainability()
      ]);
      setOverview(ov);
      setServices(svc.services || []);
      setAccounts(acct.accounts || []);
      setBudgets(bud.budgets || []);
      setAnomalies(anom.anomalies || []);
      setSavings(sav.recommendations || []);
      setUnitEconomics(unit);
      setSustainability(sust);
    } catch (error) {
      console.error('Failed to load FinOps data:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'services', label: 'By Service', icon: DollarSign },
    { id: 'accounts', label: 'By Account', icon: DollarSign },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'unit', label: 'Unit Economics', icon: Zap },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-red-400' : 'text-green-400';
  };

  const getBudgetStatus = (utilized: number) => {
    if (utilized >= 100) return 'bg-red-400/10 text-red-400 border-red-400/30';
    if (utilized >= 80) return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
    return 'bg-green-400/10 text-green-400 border-green-400/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">FinOps</h1>
            <p className="text-gray-400">Cloud financial management</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Month</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(overview.current_month)}</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${getChangeColor(overview.month_over_month_change)}`}>
              {overview.month_over_month_change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(overview.month_over_month_change)}% vs last month
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Forecasted Month</p>
            <p className="text-3xl font-bold text-blue-400">{formatCurrency(overview.forecasted_month)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">YTD Spend</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(overview.year_to_date)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-emerald-500/30">
            <p className="text-gray-400 text-sm">Potential Savings</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(overview.potential_savings)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Trend Chart Placeholder */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Trend (Last 6 Months)</h3>
            <div className="h-48 flex items-end gap-2">
              {overview.trend?.map((month: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-emerald-500 rounded-t"
                    style={{ height: `${(month.cost / Math.max(...overview.trend.map((m: any) => m.cost))) * 100}%` }}
                  ></div>
                  <p className="text-gray-400 text-xs mt-2">{month.month}</p>
                  <p className="text-white text-xs">{formatCurrency(month.cost)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Top Services by Spend</h3>
            <div className="space-y-3">
              {services.slice(0, 5).map((service) => (
                <div key={service.service} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white">{service.service}</span>
                      <span className="text-gray-400">{formatCurrency(service.cost)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(service.cost / services[0].cost) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`text-sm ${getChangeColor(service.change)}`}>
                    {service.change > 0 ? '+' : ''}{service.change}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">Service</th>
                <th className="text-right p-4 text-gray-400 font-medium">Cost</th>
                <th className="text-right p-4 text-gray-400 font-medium">% of Total</th>
                <th className="text-right p-4 text-gray-400 font-medium">Change</th>
                <th className="text-right p-4 text-gray-400 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.service} className="border-t border-gray-700">
                  <td className="p-4 text-white">{service.service}</td>
                  <td className="p-4 text-right text-white">{formatCurrency(service.cost)}</td>
                  <td className="p-4 text-right text-gray-400">{service.percentage}%</td>
                  <td className={`p-4 text-right ${getChangeColor(service.change)}`}>
                    {service.change > 0 ? '+' : ''}{service.change}%
                  </td>
                  <td className="p-4 text-right">
                    {service.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-red-400 inline" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-400 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">Account</th>
                <th className="text-right p-4 text-gray-400 font-medium">Cost</th>
                <th className="text-right p-4 text-gray-400 font-medium">Budget</th>
                <th className="text-right p-4 text-gray-400 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.account_id} className="border-t border-gray-700">
                  <td className="p-4">
                    <p className="text-white">{account.account_name}</p>
                    <p className="text-gray-500 text-sm">{account.account_id}</p>
                  </td>
                  <td className="p-4 text-right text-white">{formatCurrency(account.cost)}</td>
                  <td className="p-4 text-right text-gray-400">{formatCurrency(account.budget)}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-sm border ${getBudgetStatus(account.budget_utilization)}`}>
                      {account.budget_utilization}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <div key={budget.name} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">{budget.name}</h4>
                <span className={`px-2 py-1 rounded text-xs border ${getBudgetStatus(budget.utilized_percent)}`}>
                  {budget.utilized_percent}% utilized
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Spent</span>
                  <span className="text-white">{formatCurrency(budget.actual)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Budget</span>
                  <span className="text-white">{formatCurrency(budget.limit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Forecasted</span>
                  <span className="text-blue-400">{formatCurrency(budget.forecasted)}</span>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    budget.utilized_percent >= 100 ? 'bg-red-500' :
                    budget.utilized_percent >= 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budget.utilized_percent, 100)}%` }}
                ></div>
              </div>

              {budget.alerts?.length > 0 && (
                <div className="mt-4 space-y-1">
                  {budget.alerts.map((alert: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.triggered ? 'text-red-400' : 'text-gray-500'
                      }`} />
                      <span className={alert.triggered ? 'text-red-400' : 'text-gray-500'}>
                        Alert at {alert.threshold}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {anomalies.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
              <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No cost anomalies detected</p>
            </div>
          ) : (
            anomalies.map((anomaly) => (
              <div key={anomaly.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-semibold">{anomaly.service}</span>
                    </div>
                    <p className="text-gray-400">{anomaly.root_cause}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-gray-500">Account: {anomaly.account_id}</span>
                      <span className="text-gray-500">Region: {anomaly.region}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 text-2xl font-bold">+{formatCurrency(anomaly.impact)}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(anomaly.detected_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Savings Tab */}
      {activeTab === 'savings' && (
        <div className="space-y-4">
          {savings.map((rec) => (
            <div key={rec.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      rec.type === 'COMMITMENT' ? 'bg-blue-400/10 text-blue-400' :
                      rec.type === 'OPTIMIZATION' ? 'bg-purple-400/10 text-purple-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {rec.type}
                    </span>
                    <span className="text-white font-semibold">{rec.title}</span>
                  </div>
                  <p className="text-gray-400">{rec.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-500">Effort: {rec.effort}</span>
                    <span className="text-gray-500">Confidence: {rec.confidence}%</span>
                    <span className="text-gray-500">{rec.resource_count} resources</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-2xl font-bold">{formatCurrency(rec.estimated_monthly_savings)}/mo</p>
                  <p className="text-gray-500 text-sm">{formatCurrency(rec.estimated_annual_savings)}/yr</p>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 w-full">
                Implement Recommendation
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Unit Economics Tab */}
      {activeTab === 'unit' && unitEconomics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unitEconomics.metrics?.map((metric: any) => (
              <div key={metric.name} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">{metric.name}</p>
                <p className="text-3xl font-bold text-white mt-2">{metric.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(-metric.change)}`}>
                  {metric.change < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {Math.abs(metric.change)}% vs last month
                </div>
                <p className="text-gray-500 text-sm mt-1">Target: {metric.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sustainability Tab */}
      {activeTab === 'sustainability' && sustainability && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-400" />
                <p className="text-gray-400">Carbon Footprint</p>
              </div>
              <p className="text-3xl font-bold text-white">{sustainability.carbon_footprint_tons} tons</p>
              <p className="text-gray-500 text-sm mt-1">CO2 equivalent</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400 text-sm">Renewable Energy</p>
              <p className="text-3xl font-bold text-green-400">{sustainability.renewable_energy_percent}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${sustainability.renewable_energy_percent}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400 text-sm">Efficiency Score</p>
              <p className="text-3xl font-bold text-blue-400">{sustainability.efficiency_score}</p>
              <p className="text-gray-500 text-sm mt-1">out of 100</p>
            </div>
          </div>

          {/* Region Breakdown */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Carbon by Region</h3>
            <div className="space-y-3">
              {sustainability.by_region?.map((region: any) => (
                <div key={region.region} className="flex items-center gap-4">
                  <span className="text-gray-400 w-24">{region.region}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(region.tons / sustainability.carbon_footprint_tons) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-white w-20 text-right">{region.tons} tons</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
