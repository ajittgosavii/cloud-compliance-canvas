import { Link2 } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link2 className="text-indigo-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔗 Integrations Hub</h1>
          <p className="text-gray-500">Connect with Jira, ServiceNow, Slack, and more</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Integrations content will be migrated from Streamlit.</p>
        <p className="text-sm text-gray-400 mt-2">Features: JIRA, ServiceNow, Slack, PagerDuty, GitHub integration</p>
      </div>
    </div>
  );
}
