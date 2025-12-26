import { Shield } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="text-blue-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎯 Compliance Dashboard</h1>
          <p className="text-gray-500">Multi-framework compliance monitoring and reporting</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Compliance dashboard content will be migrated from Streamlit.</p>
        <p className="text-sm text-gray-400 mt-2">Features: SOC 2, PCI-DSS, HIPAA, GDPR, ISO 27001 mapping</p>
      </div>
    </div>
  );
}
