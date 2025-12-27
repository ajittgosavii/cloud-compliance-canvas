import { useState, useEffect } from 'react';
import { 
  Users, RefreshCw, Plus, Trash2, Settings, Filter,
  Building2, DollarSign, Shield, AlertTriangle, CheckCircle
} from 'lucide-react';
import * as api from '../services/api';

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [envFilter, setEnvFilter] = useState('all');
  const [provisionForm, setProvisionForm] = useState({
    account_name: '',
    email: '',
    template: '',
    environment: 'Development',
    cost_center: '',
    owner: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accts, tmpls] = await Promise.all([
        api.fetchAccounts({ limit: 100 }),
        api.fetchAccountTemplates()
      ]);
      setAccounts(accts.accounts || []);
      setTemplates(tmpls.templates || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
    setLoading(false);
  };

  const handleProvision = async () => {
    try {
      const result = await api.provisionAccount(provisionForm);
      alert(`Account provisioning started: ${result.provisioning_id}`);
      setShowProvisionModal(false);
      setProvisionForm({
        account_name: '',
        email: '',
        template: '',
        environment: 'Development',
        cost_center: '',
        owner: ''
      });
      loadData();
    } catch (error) {
      console.error('Provisioning failed:', error);
    }
  };

  const handleDecommission = async (accountId: string) => {
    if (!confirm('Are you sure you want to decommission this account?')) return;
    
    try {
      await api.decommissionAccount(accountId);
      alert('Decommission initiated');
      loadData();
    } catch (error) {
      console.error('Decommission failed:', error);
    }
  };

  const tabs = [
    { id: 'list', label: 'Active Accounts', icon: Users },
    { id: 'templates', label: 'Templates', icon: Settings },
    { id: 'onboard', label: 'Onboarding', icon: Plus }
  ];

  const environments = ['Production', 'Development', 'Staging', 'Sandbox', 'Security'];

  const filteredAccounts = accounts.filter(a => 
    envFilter === 'all' || a.environment?.toLowerCase() === envFilter.toLowerCase()
  );

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-400/10 text-green-400';
      case 'SUSPENDED': return 'bg-yellow-400/10 text-yellow-400';
      case 'PENDING_CLOSURE': return 'bg-red-400/10 text-red-400';
      default: return 'bg-gray-400/10 text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Account Lifecycle</h1>
            <p className="text-gray-400">Manage AWS accounts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProvisionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <Plus className="w-4 h-4" />
            New Account
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Accounts</p>
          <p className="text-3xl font-bold text-white">{accounts.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-green-500/30">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-400">
            {accounts.filter(a => a.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Monthly Cost</p>
          <p className="text-3xl font-bold text-white">
            ${accounts.reduce((acc, a) => acc + (a.monthly_cost || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Avg Compliance</p>
          <p className="text-3xl font-bold text-green-400">
            {(accounts.reduce((acc, a) => acc + (a.compliance_score || 0), 0) / accounts.length).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accounts List Tab */}
      {activeTab === 'list' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          {/* Filter */}
          <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Environments</option>
              {environments.map(env => (
                <option key={env} value={env.toLowerCase()}>{env}</option>
              ))}
            </select>
            <span className="text-gray-400 text-sm">
              Showing {filteredAccounts.length} accounts
            </span>
          </div>

          {/* Accounts Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium">Account</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Environment</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Compliance</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Monthly Cost</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Findings</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.account_id} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{account.account_name}</p>
                        <p className="text-gray-500 text-sm font-mono">{account.account_id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                        {account.environment}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${getScoreColor(account.compliance_score)}`}>
                        {account.compliance_score}%
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      ${account.monthly_cost?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {account.critical_findings > 0 && (
                        <span className="px-2 py-1 bg-red-400/10 text-red-400 rounded text-xs mr-2">
                          {account.critical_findings} critical
                        </span>
                      )}
                      <span className="text-gray-400">{account.finding_count} total</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDecommission(account.account_id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                        title="Decommission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                <span className="text-cyan-400 text-sm">{template.usage_count} uses</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">{template.description}</p>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Compliance Frameworks</p>
                  <div className="flex flex-wrap gap-1">
                    {template.compliance_frameworks?.map((fw: string) => (
                      <span key={fw} className="px-2 py-0.5 bg-green-400/10 text-green-400 rounded text-xs">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Security Controls</p>
                  <div className="flex flex-wrap gap-1">
                    {template.security_controls?.slice(0, 3).map((ctrl: string) => (
                      <span key={ctrl} className="px-2 py-0.5 bg-blue-400/10 text-blue-400 rounded text-xs">
                        {ctrl}
                      </span>
                    ))}
                    {template.security_controls?.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                        +{template.security_controls.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Est. baseline</span>
                  <span className="text-white font-medium">${template.estimated_baseline_cost}/mo</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setProvisionForm({ ...provisionForm, template: template.name });
                  setShowProvisionModal(true);
                }}
                className="w-full mt-4 px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Onboarding Tab */}
      {activeTab === 'onboard' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Provision New Account</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Account Name</label>
              <input
                type="text"
                value={provisionForm.account_name}
                onChange={(e) => setProvisionForm({ ...provisionForm, account_name: e.target.value })}
                placeholder="prod-app-001"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={provisionForm.email}
                onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                placeholder="aws-prod-001@company.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Template</label>
                <select
                  value={provisionForm.template}
                  onChange={(e) => setProvisionForm({ ...provisionForm, template: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Environment</label>
                <select
                  value={provisionForm.environment}
                  onChange={(e) => setProvisionForm({ ...provisionForm, environment: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  {environments.map(env => (
                    <option key={env} value={env}>{env}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Cost Center</label>
                <input
                  type="text"
                  value={provisionForm.cost_center}
                  onChange={(e) => setProvisionForm({ ...provisionForm, cost_center: e.target.value })}
                  placeholder="CC-1234"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Owner</label>
                <input
                  type="text"
                  value={provisionForm.owner}
                  onChange={(e) => setProvisionForm({ ...provisionForm, owner: e.target.value })}
                  placeholder="team-platform"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleProvision}
              disabled={!provisionForm.account_name || !provisionForm.email || !provisionForm.template}
              className="w-full mt-4 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              Provision Account
            </button>
          </div>
        </div>
      )}

      {/* Provision Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProvisionModal(false)}>
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Provision New Account</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Account Name</label>
                <input
                  type="text"
                  value={provisionForm.account_name}
                  onChange={(e) => setProvisionForm({ ...provisionForm, account_name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Email</label>
                <input
                  type="email"
                  value={provisionForm.email}
                  onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Template</label>
                <select
                  value={provisionForm.template}
                  onChange={(e) => setProvisionForm({ ...provisionForm, template: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowProvisionModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleProvision}
                disabled={!provisionForm.account_name || !provisionForm.email || !provisionForm.template}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                Provision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
