import { useState, useEffect } from 'react';
import { 
  Shield, FileCode, AlertTriangle, CheckCircle, RefreshCw, 
  Play, Eye, ChevronRight, Filter, Search, Lock
} from 'lucide-react';
import * as api from '../services/api';

interface GuardrailsPageProps {
  demoMode?: boolean;
}

export default function GuardrailsPage({ demoMode = true }: GuardrailsPageProps) {
  const [activeTab, setActiveTab] = useState('scp');
  const [scpPolicies, setSCPPolicies] = useState<any[]>([]);
  const [opaPolicies, setOPAPolicies] = useState<any[]>([]);
  const [kicsResults, setKICSResults] = useState<any>(null);
  const [violations, setViolations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scp, opa, kics, viols] = await Promise.all([
        api.fetchSCPPolicies(),
        api.fetchOPAPolicies(),
        api.fetchKICSResults(),
        api.fetchGuardrailViolations()
      ]);
      setSCPPolicies(scp.policies || []);
      setOPAPolicies(opa.policies || []);
      setKICSResults(kics);
      setViolations(viols);
    } catch (error) {
      console.error('Failed to load guardrails:', error);
    }
    setLoading(false);
  };

  const handleDeploy = async (policy: any, dryRun: boolean = true) => {
    try {
      const result = await api.deployGuardrail({
        policy_type: activeTab,
        policy_id: policy.id,
        target_accounts: ['all'],
        dry_run: dryRun
      });
      alert(result.message || 'Deployment initiated');
    } catch (error) {
      console.error('Deploy failed:', error);
    }
  };

  const tabs = [
    { id: 'scp', label: 'Service Control Policies', icon: Lock, count: scpPolicies.length },
    { id: 'opa', label: 'OPA Policies', icon: FileCode, count: opaPolicies.length },
    { id: 'kics', label: 'KICS Scanning', icon: Search, count: kicsResults?.total_findings || 0 },
    { id: 'violations', label: 'All Violations', icon: AlertTriangle, count: violations?.total || 0 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'LOW': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-400/10 text-green-400';
      case 'DRAFT': return 'bg-yellow-400/10 text-yellow-400';
      default: return 'bg-gray-400/10 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Tech Guardrails</h1>
            <p className="text-gray-400">Policy management and enforcement</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`bg-gray-800 rounded-xl p-4 border cursor-pointer transition-all ${
              activeTab === tab.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className="text-2xl font-bold text-white">{tab.count}</span>
            </div>
            <p className="text-gray-400 mt-2 text-sm">{tab.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        {/* Tab Header */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* SCP Policies Tab */}
        {activeTab === 'scp' && (
          <div className="p-6">
            <div className="space-y-4">
              {scpPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-semibold">{policy.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(policy.status)}`}>
                          {policy.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-600 text-gray-300">
                          {policy.type}
                        </span>
                      </div>
                      <p className="text-gray-400 mt-1 text-sm">{policy.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="text-gray-500">
                          Targets: {policy.targets?.length || 0}
                        </span>
                        {policy.violations > 0 && (
                          <span className="text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {policy.violations} violations
                          </span>
                        )}
                        <span className="text-green-400">
                          {policy.compliance_rate}% compliant
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPolicy(policy)}
                        className="p-2 bg-gray-600 rounded-lg hover:bg-gray-500 text-gray-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeploy(policy, true)}
                        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPA Policies Tab */}
        {activeTab === 'opa' && (
          <div className="p-6">
            <div className="space-y-4">
              {opaPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-semibold">{policy.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(policy.status)}`}>
                          {policy.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-400/10 text-purple-400">
                          {policy.language}
                        </span>
                      </div>
                      <p className="text-gray-400 mt-1 text-sm">{policy.description}</p>
                      {policy.violations > 0 && (
                        <p className="text-red-400 mt-2 text-sm flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {policy.violations} active violations
                        </p>
                      )}
                    </div>
                    <button className="p-2 bg-gray-600 rounded-lg hover:bg-gray-500 text-gray-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KICS Tab */}
        {activeTab === 'kics' && kicsResults && (
          <div className="p-6">
            {/* KICS Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(kicsResults.by_severity || {}).map(([severity, count]) => (
                <div key={severity} className={`rounded-lg p-4 border ${getSeverityColor(severity)}`}>
                  <p className="text-sm opacity-80">{severity}</p>
                  <p className="text-2xl font-bold">{count as number}</p>
                </div>
              ))}
            </div>

            {/* KICS Findings */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Infrastructure as Code Findings</h4>
              {kicsResults.findings?.slice(0, 20).map((finding: any) => (
                <div
                  key={finding.id}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                        <span className="text-white font-medium">{finding.query_name}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {finding.file}:{finding.line}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">{finding.category}</p>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      View Fix
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Violations Tab */}
        {activeTab === 'violations' && violations && (
          <div className="p-6">
            {/* Violations Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">SCP Violations</p>
                <p className="text-2xl font-bold text-white">{violations.scp_violations}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">OPA Violations</p>
                <p className="text-2xl font-bold text-white">{violations.opa_violations}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">KICS Findings</p>
                <p className="text-2xl font-bold text-white">{violations.kics_violations}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-red-400">{violations.total}</p>
              </div>
            </div>

            {/* By Severity */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(violations.by_severity || {}).map(([severity, count]) => (
                <div key={severity} className={`rounded-lg p-4 border ${getSeverityColor(severity)}`}>
                  <p className="text-sm opacity-80">{severity}</p>
                  <p className="text-2xl font-bold">{count as number}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPolicy(null)}>
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">{selectedPolicy.name}</h3>
            <p className="text-gray-400 mb-4">{selectedPolicy.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <p className="text-white">{selectedPolicy.status}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Type</p>
                <p className="text-white">{selectedPolicy.type}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Created</p>
                <p className="text-white">{new Date(selectedPolicy.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Last Modified</p>
                <p className="text-white">{new Date(selectedPolicy.last_modified).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedPolicy.targets?.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-2">Targets</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPolicy.targets.map((target: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                      {target}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => handleDeploy(selectedPolicy, false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
              >
                Deploy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
