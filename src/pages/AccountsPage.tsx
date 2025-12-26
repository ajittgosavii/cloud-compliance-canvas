import { Users } from 'lucide-react';

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-blue-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔄 Account Lifecycle</h1>
          <p className="text-gray-500">AWS account provisioning and management</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Account lifecycle content will be migrated from Streamlit.</p>
        <p className="text-sm text-gray-400 mt-2">Features: Account provisioning, templates, Control Tower, offboarding</p>
      </div>
    </div>
  );
}
