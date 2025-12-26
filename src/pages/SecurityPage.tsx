import { Search } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="text-purple-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔍 Security Findings</h1>
          <p className="text-gray-500">AWS Security Hub, GuardDuty, and Config findings</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Security findings content will be migrated from Streamlit.</p>
        <p className="text-sm text-gray-400 mt-2">Features: Security Hub integration, real-time findings, compliance status</p>
      </div>
    </div>
  );
}
