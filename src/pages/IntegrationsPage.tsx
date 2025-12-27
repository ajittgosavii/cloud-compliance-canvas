import { useState, useEffect } from 'react';
import { 
  Link2, RefreshCw, Send, AlertTriangle, CheckCircle,
  Github, MessageSquare, Ticket, Bell, ExternalLink
} from 'lucide-react';
import * as api from '../services/api';

interface IntegrationsPageProps {
  demoMode?: boolean;
}

export default function IntegrationsPage({ demoMode = true }: IntegrationsPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [githubData, setGithubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [jiraForm, setJiraForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    project: 'SEC'
  });

  const [slackForm, setSlackForm] = useState({
    channel: '#security-alerts',
    message: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const github = await api.fetchGitHubSecurity();
      setGithubData(github);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
    setLoading(false);
  };

  const handleJiraCreate = async () => {
    setSending(true);
    try {
      const result = await api.createJiraTicket(jiraForm);
      alert(`Jira ticket created: ${result.ticket_id}`);
      setJiraForm({ title: '', description: '', priority: 'medium', project: 'SEC' });
    } catch (error) {
      console.error('Failed to create Jira ticket:', error);
      alert('Failed to create ticket');
    }
    setSending(false);
  };

  const handleSlackSend = async () => {
    setSending(true);
    try {
      await api.sendSlackNotification(slackForm);
      alert('Slack notification sent');
      setSlackForm({ ...slackForm, message: '' });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      alert('Failed to send notification');
    }
    setSending(false);
  };

  const handleServiceNow = async () => {
    setSending(true);
    try {
      const result = await api.createServiceNowIncident({
        short_description: 'Security Alert from Cloud Compliance Canvas',
        urgency: '2',
        impact: '2'
      });
      alert(`ServiceNow incident created: ${result.incident_number}`);
    } catch (error) {
      console.error('Failed to create ServiceNow incident:', error);
    }
    setSending(false);
  };

  const handlePagerDuty = async () => {
    setSending(true);
    try {
      const result = await api.triggerPagerDuty({
        summary: 'Critical Security Alert',
        severity: 'critical',
        source: 'Cloud Compliance Canvas'
      });
      alert(`PagerDuty incident triggered: ${result.incident_key}`);
    } catch (error) {
      console.error('Failed to trigger PagerDuty:', error);
    }
    setSending(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Link2 },
    { id: 'jira', label: 'Jira', icon: Ticket },
    { id: 'slack', label: 'Slack', icon: MessageSquare },
    { id: 'servicenow', label: 'ServiceNow', icon: Ticket },
    { id: 'pagerduty', label: 'PagerDuty', icon: Bell },
    { id: 'github', label: 'GitHub', icon: Github }
  ];

  const integrations = [
    { name: 'Jira', description: 'Create tickets from findings', icon: Ticket, status: 'configured', color: 'blue' },
    { name: 'Slack', description: 'Send security alerts', icon: MessageSquare, status: 'configured', color: 'purple' },
    { name: 'ServiceNow', description: 'Create incidents', icon: Ticket, status: 'not_configured', color: 'green' },
    { name: 'PagerDuty', description: 'Trigger on-call alerts', icon: Bell, status: 'not_configured', color: 'orange' },
    { name: 'GitHub', description: 'Security alerts from GHAS', icon: Github, status: 'configured', color: 'gray' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link2 className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Integrations</h1>
            <p className="text-gray-400">Connect with external tools</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <div 
              key={integration.name}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${integration.color}-400/10`}>
                  <integration.icon className={`w-6 h-6 text-${integration.color}-400`} />
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  integration.status === 'configured' 
                    ? 'bg-green-400/10 text-green-400'
                    : 'bg-gray-400/10 text-gray-400'
                }`}>
                  {integration.status === 'configured' ? 'Connected' : 'Not Configured'}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">{integration.name}</h3>
              <p className="text-gray-400 text-sm">{integration.description}</p>
              <button
                onClick={() => setActiveTab(integration.name.toLowerCase())}
                className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
              >
                Configure
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Jira Tab */}
      {activeTab === 'jira' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Create Jira Ticket</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Title</label>
              <input
                type="text"
                value={jiraForm.title}
                onChange={(e) => setJiraForm({ ...jiraForm, title: e.target.value })}
                placeholder="Security Finding: S3 Bucket Public Access"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Description</label>
              <textarea
                value={jiraForm.description}
                onChange={(e) => setJiraForm({ ...jiraForm, description: e.target.value })}
                placeholder="Describe the security finding..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Project</label>
                <input
                  type="text"
                  value={jiraForm.project}
                  onChange={(e) => setJiraForm({ ...jiraForm, project: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Priority</label>
                <select
                  value={jiraForm.priority}
                  onChange={(e) => setJiraForm({ ...jiraForm, priority: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleJiraCreate}
              disabled={sending || !jiraForm.title}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Create Ticket
            </button>
          </div>
        </div>
      )}

      {/* Slack Tab */}
      {activeTab === 'slack' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Send Slack Notification</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Channel</label>
              <input
                type="text"
                value={slackForm.channel}
                onChange={(e) => setSlackForm({ ...slackForm, channel: e.target.value })}
                placeholder="#security-alerts"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Message</label>
              <textarea
                value={slackForm.message}
                onChange={(e) => setSlackForm({ ...slackForm, message: e.target.value })}
                placeholder="Type your message..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <button
              onClick={handleSlackSend}
              disabled={sending || !slackForm.message}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Notification
            </button>
          </div>
        </div>
      )}

      {/* ServiceNow Tab */}
      {activeTab === 'servicenow' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Create ServiceNow Incident</h3>
          </div>

          <p className="text-gray-400 mb-6">
            Create a new incident in ServiceNow for critical security findings.
          </p>

          <button
            onClick={handleServiceNow}
            disabled={sending}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Create Incident
          </button>
        </div>
      )}

      {/* PagerDuty Tab */}
      {activeTab === 'pagerduty' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Trigger PagerDuty Alert</h3>
          </div>

          <div className="bg-orange-400/10 border border-orange-400/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Warning</span>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              This will trigger an on-call alert and page the security team.
            </p>
          </div>

          <button
            onClick={handlePagerDuty}
            disabled={sending}
            className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Trigger Alert
          </button>
        </div>
      )}

      {/* GitHub Tab */}
      {activeTab === 'github' && githubData && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold text-white">{githubData.total_alerts}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Dependabot</p>
              <p className="text-3xl font-bold text-yellow-400">{githubData.dependabot_alerts}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Code Scanning</p>
              <p className="text-3xl font-bold text-orange-400">{githubData.code_scanning_alerts}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Secret Scanning</p>
              <p className="text-3xl font-bold text-red-400">{githubData.secret_scanning_alerts}</p>
            </div>
          </div>

          {/* Repositories */}
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Repository Alerts</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {githubData.repositories?.map((repo: any) => (
                <div key={repo.name} className="p-4 hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-gray-400" />
                      <span className="text-white font-medium">{repo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {repo.alerts.critical > 0 && (
                        <span className="px-2 py-1 bg-red-400/10 text-red-400 rounded text-xs">
                          {repo.alerts.critical} critical
                        </span>
                      )}
                      {repo.alerts.high > 0 && (
                        <span className="px-2 py-1 bg-orange-400/10 text-orange-400 rounded text-xs">
                          {repo.alerts.high} high
                        </span>
                      )}
                      {repo.alerts.medium > 0 && (
                        <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 rounded text-xs">
                          {repo.alerts.medium} medium
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Last scan: {new Date(repo.last_scan).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
