import React, { useState, useEffect } from 'react';
import {
  fetchGuardrailsSCP,
  fetchGuardrailsOPA,
  fetchGuardrailsKICS,
  fetchGuardrailsGHAS,
  fetchGuardrailsPRCompliance,
  fetchGuardrailsProbot,
  fetchGuardrailsAWSTools,
  fetchGuardrailsFinOpsTools,
  fetchGuardrailsAIAgents
} from '../services/api';

type TabType = 'scp' | 'opa' | 'kics' | 'ghas' | 'pr-compliance' | 'probot' | 'aws-tools' | 'finops-tools' | 'ai-agents';

export default function GuardrailsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('scp');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'scp', label: 'SCP', icon: '🔒' },
    { id: 'opa', label: 'OPA', icon: '📜' },
    { id: 'kics', label: 'KICS', icon: '🔍' },
    { id: 'ghas', label: 'GitHub Security', icon: '🐙' },
    { id: 'pr-compliance', label: 'PR Compliance', icon: '✅' },
    { id: 'probot', label: 'Probot Apps', icon: '🤖' },
    { id: 'aws-tools', label: 'AWS Tools', icon: '☁️' },
    { id: 'finops-tools', label: 'FinOps Tools', icon: '💰' },
    { id: 'ai-agents', label: 'AI Agents', icon: '🧠' },
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    try {
      let result;
      switch (tab) {
        case 'scp': result = await fetchGuardrailsSCP(); break;
        case 'opa': result = await fetchGuardrailsOPA(); break;
        case 'kics': result = await fetchGuardrailsKICS(); break;
        case 'ghas': result = await fetchGuardrailsGHAS(); break;
        case 'pr-compliance': result = await fetchGuardrailsPRCompliance(); break;
        case 'probot': result = await fetchGuardrailsProbot(); break;
        case 'aws-tools': result = await fetchGuardrailsAWSTools(); break;
        case 'finops-tools': result = await fetchGuardrailsFinOpsTools(); break;
        case 'ai-agents': result = await fetchGuardrailsAIAgents(); break;
      }
      setData(prev => ({ ...prev, [tab]: result }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const renderSCP = () => {
    const d = data.scp;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Service Control Policies</h3>
          <div className="space-y-3">
            {d.policies?.map((policy: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{policy.name}</div>
                  <div className="text-sm text-gray-500">{policy.description || policy.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  {policy.aws_managed && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">AWS Managed</span>
                  )}
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOPA = () => {
    const d = data.opa;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">OPA Policies</h3>
          <div className="space-y-3">
            {d.policies?.map((policy: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{policy.name}</div>
                  <div className="text-sm text-gray-500">ID: {policy.id}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-red-600 font-medium">{policy.violations} violations</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    policy.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                  }`}>{policy.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGHAS = () => {
    const d = data.ghas;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-indigo-600">{d.enabled_repos}/{d.total_repos}</div>
            <div className="text-gray-500">Enabled Repos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{d.secret_scanning?.open || 0}</div>
            <div className="text-gray-500">Open Secrets</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-red-600">{d.code_scanning?.critical || 0}</div>
            <div className="text-gray-500">Critical Code Issues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-yellow-600">{d.dependabot?.alerts || 0}</div>
            <div className="text-gray-500">Dependabot Alerts</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🔐 Secret Scanning</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Alerts</span><span>{d.secret_scanning?.alerts}</span></div>
              <div className="flex justify-between"><span>Resolved</span><span className="text-green-600">{d.secret_scanning?.resolved}</span></div>
              <div className="flex justify-between"><span>Open</span><span className="text-red-600">{d.secret_scanning?.open}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🛡️ Push Protection</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Status</span><span className="text-green-600">{d.push_protection?.enabled ? 'Enabled' : 'Disabled'}</span></div>
              <div className="flex justify-between"><span>Blocked Secrets</span><span>{d.push_protection?.blocked_secrets}</span></div>
              <div className="flex justify-between"><span>Bypassed</span><span className="text-yellow-600">{d.push_protection?.bypassed}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAWSTools = () => {
    const d = data['aws-tools'];
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🏗️ Control Tower</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Landing Zone</span><span>v{d.control_tower?.landing_zone_version}</span></div>
              <div className="flex justify-between"><span>Governed Accounts</span><span>{d.control_tower?.governed_accounts}</span></div>
              <div className="flex justify-between"><span>Guardrails Enabled</span><span>{d.control_tower?.guardrails_enabled}</span></div>
              <div className="flex justify-between"><span>Drift Detected</span><span className={d.control_tower?.drift_detected > 0 ? 'text-red-600' : 'text-green-600'}>{d.control_tower?.drift_detected}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🏢 Organizations</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Total Accounts</span><span>{d.organizations?.total_accounts}</span></div>
              <div className="flex justify-between"><span>OUs</span><span>{d.organizations?.ous}</span></div>
              <div className="flex justify-between"><span>SCPs Attached</span><span>{d.organizations?.scps_attached}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">⚙️ AWS Config</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Enabled Regions</span><span>{d.config?.enabled_regions}</span></div>
              <div className="flex justify-between"><span>Rules</span><span>{d.config?.rules}</span></div>
              <div className="flex justify-between"><span>Compliant</span><span className="text-green-600">{d.config?.compliant_resources?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Non-Compliant</span><span className="text-red-600">{d.config?.non_compliant_resources}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🛡️ Security Hub</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Score</span><span className="font-bold text-indigo-600">{d.security_hub?.score}%</span></div>
              <div className="flex justify-between"><span>Standards</span><span>{d.security_hub?.standards?.join(', ')}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAIAgents = () => {
    const d = data['ai-agents'];
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">🪨 Amazon Bedrock</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Guardrails</span><span className="text-green-600">{d.bedrock?.guardrails_enabled ? 'Enabled' : 'Disabled'}</span></div>
              <div className="flex justify-between"><span>Content Filters</span><span>{d.bedrock?.content_filters?.join(', ')}</span></div>
              <div className="flex justify-between"><span>Blocked (7d)</span><span className="text-red-600">{d.bedrock?.blocked_requests_7d}</span></div>
              <div className="flex justify-between"><span>Allowed Models</span><span>{d.bedrock?.models_allowed?.join(', ')}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">💰 Cost Controls</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Monthly Limit</span><span>${d.cost_controls?.monthly_limit?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Current Spend</span><span>${d.cost_controls?.current_spend?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Projected</span><span>${d.cost_controls?.projected?.toLocaleString()}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${(d.cost_controls?.current_spend / d.cost_controls?.monthly_limit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">AI Policies</h3>
          <div className="space-y-3">
            {d.ai_policies?.map((policy: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{policy.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-orange-600">{policy.violations_7d || policy.logged_7d || 0} events</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    policy.status === 'enforcing' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>{policy.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🚧 Guardrails</h1>
      
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
          {activeTab === 'scp' && renderSCP()}
          {activeTab === 'opa' && renderOPA()}
          {activeTab === 'ghas' && renderGHAS()}
          {activeTab === 'aws-tools' && renderAWSTools()}
          {activeTab === 'ai-agents' && renderAIAgents()}
          {activeTab === 'kics' && <div className="bg-white rounded-lg shadow p-6"><h3>KICS IaC Scanning</h3><p className="text-gray-500">KICS scan results will appear here</p></div>}
          {activeTab === 'pr-compliance' && <div className="bg-white rounded-lg shadow p-6"><h3>PR Compliance</h3><p className="text-gray-500">PolicyBot/Bulldozer status will appear here</p></div>}
          {activeTab === 'probot' && <div className="bg-white rounded-lg shadow p-6"><h3>Probot Apps</h3><p className="text-gray-500">Custom Probot apps status will appear here</p></div>}
          {activeTab === 'finops-tools' && <div className="bg-white rounded-lg shadow p-6"><h3>FinOps Tools</h3><p className="text-gray-500">FinOps policy tools will appear here</p></div>}
        </>
      )}
    </div>
  );
}
