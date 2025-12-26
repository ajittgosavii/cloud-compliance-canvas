import { Fence } from 'lucide-react';

export default function GuardrailsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Fence className="text-orange-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🚧 Tech Guardrails</h1>
          <p className="text-gray-500">SCPs, OPA Policies, KICS Scanning, Policy as Code</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Tech guardrails content will be migrated from Streamlit.</p>
        <p className="text-sm text-gray-400 mt-2">Features: SCP engine, OPA policies, KICS IaC scanning, multi-account deployment</p>
      </div>
    </div>
  );
}
