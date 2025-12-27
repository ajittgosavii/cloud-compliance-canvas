import { useState, useEffect } from 'react';
import {
  fetchFinOpsOverview,
  fetchAIMLCosts,
  fetchCostAnomalies,
  fetchSavingsRecommendations,
  fetchBudgets,
  fetchWasteDetection,
  fetchChargeback,
  fetchUnitEconomics,
  fetchSustainability,
  fetchDataPipelines,
  fetchComputeOptimizer
} from '../services/api';

type TabType = 'overview' | 'aiml' | 'anomalies' | 'optimization' | 'budget' | 'waste' | 'chargeback' | 'unit-economics' | 'sustainability' | 'pipelines' | 'optimizer';

export default function FinOpsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Cost Overview', icon: '💵' },
    { id: 'aiml', label: 'AI/ML Costs', icon: '🤖' },
    { id: 'anomalies', label: 'Anomalies', icon: '⚠️' },
    { id: 'optimization', label: 'Optimization', icon: '📊' },
    { id: 'budget', label: 'Budget & Forecast', icon: '📈' },
    { id: 'waste', label: 'Waste Detection', icon: '🗑️' },
    { id: 'chargeback', label: 'Chargeback', icon: '💳' },
    { id: 'unit-economics', label: 'Unit Economics', icon: '📉' },
    { id: 'sustainability', label: 'Sustainability', icon: '🌱' },
    { id: 'pipelines', label: 'Data Pipelines', icon: '🔧' },
    { id: 'optimizer', label: 'Optimization Engine', icon: '🧠' },
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    try {
      let result;
      switch (tab) {
        case 'overview': result = await fetchFinOpsOverview(); break;
        case 'aiml': result = await fetchAIMLCosts(); break;
        case 'anomalies': result = await fetchCostAnomalies(); break;
        case 'optimization': result = await fetchSavingsRecommendations(); break;
        case 'budget': result = await fetchBudgets(); break;
        case 'waste': result = await fetchWasteDetection(); break;
        case 'chargeback': result = await fetchChargeback(); break;
        case 'unit-economics': result = await fetchUnitEconomics(); break;
        case 'sustainability': result = await fetchSustainability(); break;
        case 'pipelines': result = await fetchDataPipelines(); break;
        case 'optimizer': result = await fetchComputeOptimizer(); break;
      }
      setData(prev => ({ ...prev, [tab]: result }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const renderOverview = () => {
    const d = data.overview;
    if (!d) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-green-600">{formatCurrency(d.current_month_total || 0)}</div>
            <div className="text-gray-500">Current Month</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(d.forecast || 0)}</div>
            <div className="text-gray-500">Forecast</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{formatCurrency(d.potential_savings || 0)}</div>
            <div className="text-gray-500">Potential Savings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className={`text-3xl font-bold ${(d.month_over_month_change || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {d.month_over_month_change > 0 ? '+' : ''}{d.month_over_month_change?.toFixed(1)}%
            </div>
            <div className="text-gray-500">Month over Month</div>
          </div>
        </div>

        {d.by_service && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Cost by Service</h3>
            <div className="space-y-3">
              {d.by_service.map((svc: any, idx: number) => (
                <div key={idx} className="flex items-center">
                  <div className="w-48 font-medium">{svc.service}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mx-4">
                    <div 
                      className="bg-indigo-600 h-4 rounded-full" 
                      style={{ width: `${svc.percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-24 text-right">{formatCurrency(svc.cost)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChargeback = () => {
    const d = data.chargeback;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-indigo-600">{formatCurrency(d.total || 0)}</div>
          <div className="text-gray-500">Total Chargeback</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Cost by Team</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Team</th>
                  <th className="text-left py-2">Cost Center</th>
                  <th className="text-left py-2">Project</th>
                  <th className="text-right py-2">Cost</th>
                  <th className="text-right py-2">%</th>
                </tr>
              </thead>
              <tbody>
                {d.chargeback?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.team}</td>
                    <td className="py-2">{item.cost_center}</td>
                    <td className="py-2">{item.project}</td>
                    <td className="py-2 text-right">{formatCurrency(item.cost)}</td>
                    <td className="py-2 text-right">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderWaste = () => {
    const d = data.waste;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-red-600">{formatCurrency(d.total_waste || 0)}</div>
          <div className="text-gray-500">Total Waste Identified</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Idle EBS Volumes</h3>
            {d.idle_volumes?.length > 0 ? (
              <ul className="space-y-2">
                {d.idle_volumes.map((vol: any, idx: number) => (
                  <li key={idx} className="flex justify-between">
                    <span>{vol.volume_id}</span>
                    <span className="text-red-500">{formatCurrency(vol.monthly_cost)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No idle volumes detected</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Unused Elastic IPs</h3>
            {d.unused_eips?.length > 0 ? (
              <ul className="space-y-2">
                {d.unused_eips.map((eip: any, idx: number) => (
                  <li key={idx} className="flex justify-between">
                    <span>{eip.allocation_id}</span>
                    <span className="text-red-500">{formatCurrency(eip.monthly_cost)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No unused EIPs detected</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSavings = () => {
    const d = data.optimization;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-green-600">{formatCurrency(d.total_potential_savings || 0)}</div>
          <div className="text-gray-500">Total Potential Savings</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            {d.recommendations?.map((rec: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{rec.type}</span>
                  <span className="text-green-600 font-bold">{formatCurrency(rec.monthly_savings)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPipelines = () => {
    const d = data.pipelines;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🔧 Glue Jobs</h3>
            <div className="space-y-3">
              {d.glue_jobs?.map((job: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-sm text-gray-500">{job.duration_mins} mins</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    job.state === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                    job.state === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{job.state}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">⚡ Step Functions</h3>
            <div className="space-y-3">
              {d.step_functions?.map((sf: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{sf.name}</div>
                    <div className="text-sm text-gray-500">{sf.executions_24h} executions/24h</div>
                  </div>
                  <span className="text-green-600">{sf.success_rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">📡 EventBridge Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {d.eventbridge_rules?.map((rule: any, idx: number) => (
              <div key={idx} className="border rounded p-3">
                <div className="font-medium">{rule.name}</div>
                <div className="text-sm text-gray-500">{rule.invocations_24h} invocations</div>
                <span className={`text-xs px-2 py-1 rounded ${
                  rule.state === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>{rule.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSustainability = () => {
    const d = data.sustainability;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-green-600">{d.carbon_footprint_tons}</div>
            <div className="text-gray-500">Carbon Footprint (tons CO2)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-blue-600">{d.renewable_percentage}%</div>
            <div className="text-gray-500">Renewable Energy</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">💰 FinOps & Cost Management</h1>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'optimization' && renderSavings()}
          {activeTab === 'chargeback' && renderChargeback()}
          {activeTab === 'waste' && renderWaste()}
          {activeTab === 'pipelines' && renderPipelines()}
          {activeTab === 'sustainability' && renderSustainability()}
          {/* Add more tab renders as needed */}
        </>
      )}
    </div>
  );
}
