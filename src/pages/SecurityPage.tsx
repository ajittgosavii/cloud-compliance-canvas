import { useState, useEffect } from 'react';
import {
  fetchSecurityHub,
  fetchGuardDuty,
  fetchConfigCompliance,
  fetchInspector,
  fetchSecurityTrends
} from '../services/api';

type TabType = 'security-hub' | 'config' | 'guardduty' | 'inspector' | 'trends';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('security-hub');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'security-hub', label: 'Security Hub', icon: '🛡️' },
    { id: 'config', label: 'Config Rules', icon: '⚙️' },
    { id: 'guardduty', label: 'GuardDuty', icon: '🚨' },
    { id: 'inspector', label: 'Inspector', icon: '🔬' },
    { id: 'trends', label: 'Trends', icon: '📈' },
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    try {
      let result;
      switch (tab) {
        case 'security-hub': result = await fetchSecurityHub(); break;
        case 'config': result = await fetchConfigCompliance(); break;
        case 'guardduty': result = await fetchGuardDuty(); break;
        case 'inspector': result = await fetchInspector(); break;
        case 'trends': result = await fetchSecurityTrends(); break;
      }
      setData(prev => ({ ...prev, [tab]: result }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const renderSecurityHub = () => {
    const d = data['security-hub'];
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(d.by_severity || {}).map(([severity, count]) => (
            <div key={severity} className="bg-white rounded-lg shadow p-4">
              <div className={`text-3xl font-bold ${
                severity === 'CRITICAL' ? 'text-red-600' :
                severity === 'HIGH' ? 'text-orange-600' :
                severity === 'MEDIUM' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>{count as number}</div>
              <div className="text-gray-500">{severity}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Recent Findings</h3>
          <div className="space-y-3">
            {d.findings?.slice(0, 10).map((finding: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 border rounded">
                <span className={`px-2 py-1 rounded text-white text-sm ${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{finding.title}</div>
                  <div className="text-sm text-gray-500">{finding.resource_type}</div>
                </div>
                <span className="text-sm text-gray-400">{finding.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGuardDuty = () => {
    const d = data.guardduty;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-orange-600">{d.total || d.findings?.length || 0}</div>
          <div className="text-gray-500">Total Findings</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">GuardDuty Findings</h3>
          <div className="space-y-3">
            {d.findings?.map((finding: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 border rounded">
                <span className={`px-2 py-1 rounded text-white text-sm ${
                  finding.severity >= 7 ? 'bg-red-500' :
                  finding.severity >= 4 ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}>
                  {finding.severity}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{finding.type}</div>
                  <div className="text-sm text-gray-500">{finding.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderConfig = () => {
    const d = data.config;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Config Rules Compliance</h3>
          <div className="space-y-3">
            {d.rules?.map((rule: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{rule.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  rule.compliance === 'COMPLIANT' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>{rule.compliance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    const d = data.trends;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">Critical Trend</div>
            <div className={`text-2xl font-bold ${
              d.summary?.critical_trend === 'decreasing' ? 'text-green-600' : 'text-red-600'
            }`}>
              {d.summary?.critical_trend === 'decreasing' ? '↓ Decreasing' : '↑ Increasing'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">Resolution Rate</div>
            <div className="text-2xl font-bold text-indigo-600">{d.summary?.resolution_rate}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">MTTR</div>
            <div className="text-2xl font-bold text-blue-600">{d.summary?.mttr_hours}h</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">30-Day Trend</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-right py-2">Critical</th>
                  <th className="text-right py-2">High</th>
                  <th className="text-right py-2">Medium</th>
                  <th className="text-right py-2">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {d.trends?.slice(-7).map((day: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{day.date}</td>
                    <td className="py-2 text-right text-red-600">{day.critical}</td>
                    <td className="py-2 text-right text-orange-600">{day.high}</td>
                    <td className="py-2 text-right text-yellow-600">{day.medium}</td>
                    <td className="py-2 text-right text-green-600">{day.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Security</h1>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
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
          {activeTab === 'security-hub' && renderSecurityHub()}
          {activeTab === 'guardduty' && renderGuardDuty()}
          {activeTab === 'config' && renderConfig()}
          {activeTab === 'trends' && renderTrends()}
          {activeTab === 'inspector' && <div className="text-gray-500">Inspector findings will appear here</div>}
        </>
      )}
    </div>
  );
}
