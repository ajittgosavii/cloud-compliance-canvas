import { Bot } from 'lucide-react';

export default function RemediationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="text-green-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤖 AI-Powered Remediation</h1>
          <p className="text-gray-500">Automated threat response and code generation</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Remediation content will be migrated from Streamlit.</p>
        <p className="text-sm text-gray-400 mt-2">Features: AI code generation, batch remediation, Windows/Linux scripts</p>
      </div>
    </div>
  );
}
