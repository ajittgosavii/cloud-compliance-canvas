import { useState, useEffect } from 'react';
import {
  fetchAccounts,
  fetchAccountTemplates,
  fetchAccountApprovals,
  provisionAccount,
  offboardAccount
} from '../services/api';

type TabType = 'onboarding' | 'offboarding' | 'active';

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  
  // Onboarding form
  const [accountName, setAccountName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [frameworks, setFrameworks] = useState<string[]>([]);
  
  // Offboarding form
  const [offboardAccountId, setOffboardAccountId] = useState('');
  const [offboardReason, setOffboardReason] = useState('');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'onboarding', label: 'Onboarding', icon: '➕' },
    { id: 'offboarding', label: 'Offboarding', icon: '➖' },
    { id: 'active', label: 'Active Accounts', icon: '📊' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, templatesData, approvalsData] = await Promise.all([
        fetchAccounts(),
        fetchAccountTemplates(),
        fetchAccountApprovals()
      ]);
      setAccounts(accountsData.accounts || []);
      setTemplates(templatesData.templates || []);
      setApprovals(approvalsData.approvals || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleProvision = async () => {
    if (!accountName || !selectedTemplate) {
      alert('Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      await provisionAccount({
        account_name: accountName,
        template_id: selectedTemplate,
        portfolio,
        compliance_frameworks: frameworks
      });
      alert('Account provisioning request submitted!');
      setAccountName('');
      setSelectedTemplate('');
      setPortfolio('');
      setFrameworks([]);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting request');
    }
    setLoading(false);
  };

  const handleOffboard = async () => {
    if (!offboardAccountId) {
      alert('Please select an account');
      return;
    }
    setLoading(true);
    try {
      await offboardAccount({
        account_id: offboardAccountId,
        reason: offboardReason
      });
      alert('Offboarding request submitted!');
      setOffboardAccountId('');
      setOffboardReason('');
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting request');
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const renderOnboarding = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">AWS Account Onboarding</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Account Name *</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="prod-analytics-001"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Template *</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select template...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Portfolio</label>
            <select
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select portfolio...</option>
              <option value="Retail">Retail</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial">Financial</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Compliance Frameworks</label>
            <div className="space-y-2">
              {['PCI DSS', 'HIPAA', 'SOC 2', 'GDPR', 'ISO 27001'].map(fw => (
                <label key={fw} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={frameworks.includes(fw)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFrameworks([...frameworks, fw]);
                      } else {
                        setFrameworks(frameworks.filter(f => f !== fw));
                      }
                    }}
                  />
                  {fw}
                </label>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleProvision}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">🎯 Onboarding Steps</h3>
        <ol className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Enable Security Hub</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Enable GuardDuty</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Enable AWS Config</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Enable Inspector</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Apply SCPs</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Configure EventBridge</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Send notifications</li>
        </ol>
        
        {approvals.filter(a => a.type === 'onboarding').length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Pending Approvals</h4>
            {approvals.filter(a => a.type === 'onboarding').map((a, idx) => (
              <div key={idx} className="p-2 bg-yellow-50 rounded text-sm">
                {a.account_name} - {a.status}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOffboarding = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">AWS Account Offboarding</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Account *</label>
            <select
              value={offboardAccountId}
              onChange={(e) => setOffboardAccountId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select account...</option>
              {accounts.map(a => (
                <option key={a.account_id} value={a.account_id}>
                  {a.account_name} ({a.account_id})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              value={offboardReason}
              onChange={(e) => setOffboardReason(e.target.value)}
              placeholder="Project completed, migration, etc."
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          
          <button
            onClick={handleOffboard}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Offboarding Request'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">⚠️ Offboarding Steps</h3>
        <ol className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><span>1.</span> Notify stakeholders</li>
          <li className="flex items-center gap-2"><span>2.</span> Backup critical data</li>
          <li className="flex items-center gap-2"><span>3.</span> Disable new resources</li>
          <li className="flex items-center gap-2"><span>4.</span> Remove from organization</li>
          <li className="flex items-center gap-2"><span>5.</span> Archive logs</li>
          <li className="flex items-center gap-2"><span>6.</span> Update CMDB</li>
          <li className="flex items-center gap-2"><span>7.</span> Final audit</li>
        </ol>
      </div>
    </div>
  );

  const renderActiveAccounts = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Active AWS Accounts ({accounts.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Account ID</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Compliance</th>
              <th className="text-right py-2">Monthly Cost</th>
              <th className="text-right py-2">Findings</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-3 font-mono text-sm">{account.account_id || account.Id}</td>
                <td className="py-3">{account.account_name || account.Name}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    (account.status || account.Status) === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100'
                  }`}>
                    {account.status || account.Status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={`font-medium ${
                    account.compliance_score >= 90 ? 'text-green-600' :
                    account.compliance_score >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {account.compliance_score || '-'}%
                  </span>
                </td>
                <td className="py-3 text-right">{account.monthly_cost ? formatCurrency(account.monthly_cost) : '-'}</td>
                <td className="py-3 text-right">{account.finding_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔄 Account Lifecycle</h1>
      
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

      {loading && activeTab === 'active' ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'onboarding' && renderOnboarding()}
          {activeTab === 'offboarding' && renderOffboarding()}
          {activeTab === 'active' && renderActiveAccounts()}
        </>
      )}
    </div>
  );
}
