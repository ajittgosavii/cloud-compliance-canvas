import { useState, useEffect } from 'react';
import {
  fetchGitHubAlerts,
  fetchSnowflakeStatus,
  fetchCloudabilityData,
  createJiraTicket,
  sendSlackMessage
} from '../services/api';

type TabType = 'jira' | 'servicenow' | 'slack' | 'pagerduty' | 'github' | 'snowflake' | 'cloudability';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('jira');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});
  
  // Form states
  const [jiraTitle, setJiraTitle] = useState('');
  const [jiraDescription, setJiraDescription] = useState('');
  const [slackChannel, setSlackChannel] = useState('#security-alerts');
  const [slackMessage, setSlackMessage] = useState('');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'jira', label: 'Jira', icon: '📋' },
    { id: 'servicenow', label: 'ServiceNow', icon: '🎫' },
    { id: 'slack', label: 'Slack', icon: '💬' },
    { id: 'pagerduty', label: 'PagerDuty', icon: '🚨' },
    { id: 'github', label: 'GitHub', icon: '🐙' },
    { id: 'snowflake', label: 'Snowflake', icon: '❄️' },
    { id: 'cloudability', label: 'Cloudability', icon: '📊' },
  ];

  useEffect(() => {
    if (['github', 'snowflake', 'cloudability'].includes(activeTab)) {
      loadTabData(activeTab);
    }
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    try {
      let result;
      switch (tab) {
        case 'github': result = await fetchGitHubAlerts(); break;
        case 'snowflake': result = await fetchSnowflakeStatus(); break;
        case 'cloudability': result = await fetchCloudabilityData(); break;
      }
      if (result) setData(prev => ({ ...prev, [tab]: result }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleCreateJira = async () => {
    if (!jiraTitle) return alert('Please enter a title');
    setLoading(true);
    try {
      const result = await createJiraTicket({ title: jiraTitle, description: jiraDescription });
      alert(`Jira ticket created: ${result.ticket_id}`);
      setJiraTitle('');
      setJiraDescription('');
    } catch (error) {
      alert('Error creating ticket');
    }
    setLoading(false);
  };

  const handleSendSlack = async () => {
    if (!slackMessage) return alert('Please enter a message');
    setLoading(true);
    try {
      await sendSlackMessage({ channel: slackChannel, message: slackMessage });
      alert('Message sent to Slack!');
      setSlackMessage('');
    } catch (error) {
      alert('Error sending message');
    }
    setLoading(false);
  };

  const renderJira = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Create Jira Ticket</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={jiraTitle}
              onChange={(e) => setJiraTitle(e.target.value)}
              placeholder="Security Finding: S3 Public Access"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={jiraDescription}
              onChange={(e) => setJiraDescription(e.target.value)}
              placeholder="Detailed description..."
              className="w-full border rounded px-3 py-2"
              rows={4}
            />
          </div>
          <button
            onClick={handleCreateJira}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Jira Integration Status</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Connected to Jira Cloud</span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Instance: company.atlassian.net</p>
            <p>Project: SEC (Security)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSlack = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Send Slack Message</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Channel</label>
            <select
              value={slackChannel}
              onChange={(e) => setSlackChannel(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="#security-alerts">#security-alerts</option>
              <option value="#cloud-ops">#cloud-ops</option>
              <option value="#finops">#finops</option>
              <option value="#compliance">#compliance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message *</label>
            <textarea
              value={slackMessage}
              onChange={(e) => setSlackMessage(e.target.value)}
              placeholder="Alert message..."
              className="w-full border rounded px-3 py-2"
              rows={4}
            />
          </div>
          <button
            onClick={handleSendSlack}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Slack Integration Status</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Connected to Slack Workspace</span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Workspace: Company Cloud Ops</p>
            <p>Bot: CloudComplianceBot</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGitHub = () => {
    const d = data.github;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-gray-800">{d?.total_alerts || 0}</div>
            <div className="text-gray-500">Total Alerts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-yellow-600">{d?.dependabot_alerts || 0}</div>
            <div className="text-gray-500">Dependabot</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{d?.code_scanning_alerts || 0}</div>
            <div className="text-gray-500">Code Scanning</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-red-600">{d?.secret_scanning_alerts || 0}</div>
            <div className="text-gray-500">Secret Scanning</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSnowflake = () => {
    const d = data.snowflake;
    if (!d) return <div className="text-gray-500">Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${d.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-medium">{d.connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{d.account}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-indigo-600">{d.rows_synced_24h?.toLocaleString()}</div>
            <div className="text-gray-500">Rows Synced (24h)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-medium text-green-600">{d.sync_status}</div>
            <div className="text-gray-500">Sync Status</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Databases & Tables</h3>
          <div className="space-y-4">
            {Object.entries(d.tables || {}).map(([db, tables]: [string, any]) => (
              <div key={db} className="border rounded p-4">
                <h4 className="font-medium mb-2">{db}</h4>
                <div className="flex flex-wrap gap-2">
                  {(tables as string[]).map((table, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm">{table}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCloudability = () => {
    const d = data.cloudability;
    if (!d) return <div className="text-gray-500">Loading...</div>;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {d.views?.map((view: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-indigo-600">{formatCurrency(view.current_month)}</div>
              <div className="text-gray-500">{view.name}</div>
              <div className={`text-sm ${view.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {view.change > 0 ? '+' : ''}{view.change}% {view.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Savings Recommendations</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>RI Recommendations</span>
                <span className="text-green-600 font-medium">{formatCurrency(d.recommendations?.ri_recommendations || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rightsizing</span>
                <span className="text-green-600 font-medium">{formatCurrency(d.recommendations?.rightsizing || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Idle Resources</span>
                <span className="text-green-600 font-medium">{formatCurrency(d.recommendations?.idle_resources || 0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total Savings</span>
                <span className="text-green-600">{formatCurrency(d.recommendations?.total_savings || 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Showback Reports</h3>
            <div className="space-y-3">
              {d.showback_reports?.map((report: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span>{report.name}</span>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(report.cost)}</div>
                    <div className={`text-sm ${report.variance < 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {report.variance > 0 ? '+' : ''}{report.variance}% vs budget
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔗 Integrations</h1>
      
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
          {activeTab === 'jira' && renderJira()}
          {activeTab === 'slack' && renderSlack()}
          {activeTab === 'github' && renderGitHub()}
          {activeTab === 'snowflake' && renderSnowflake()}
          {activeTab === 'cloudability' && renderCloudability()}
          {activeTab === 'servicenow' && <div className="bg-white rounded-lg shadow p-6"><h3>ServiceNow Integration</h3><p className="text-gray-500">ServiceNow configuration will appear here</p></div>}
          {activeTab === 'pagerduty' && <div className="bg-white rounded-lg shadow p-6"><h3>PagerDuty Integration</h3><p className="text-gray-500">PagerDuty configuration will appear here</p></div>}
        </>
      )}
    </div>
  );
}
