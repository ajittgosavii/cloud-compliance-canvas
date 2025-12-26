import { Bug } from 'lucide-react';

export default function VulnerabilitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bug className="text-red-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔬 Vulnerability Dashboard</h1>
          <p className="text-gray-500">AWS Inspector, EKS container, and dependency scanning</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Vulnerability scanning content will be migrated from Streamlit.</p>
        <p className="text-sm text-gray-400 mt-2">Features: Inspector v2, Trivy, Snyk integration, CVSS scoring</p>
      </div>
    </div>
  );
}
