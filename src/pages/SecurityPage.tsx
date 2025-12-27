import React, { useState, useEffect } from 'react';
import { 
  Shield, RefreshCw, AlertTriangle, Eye, Filter,
  ShieldAlert, Radar, Settings, Search
} from 'lucide-react';
import * as api from '../services/api';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('securityhub');
  const [securityHubFindings, setSecurityHubFindings] = useState<any[]>([]);
  const [guardDutyFindings, setGuardDutyFindings] = useState<any[]>([]);
  const [configRules, setConfigRules] = useState<any[]>([]);
  const [inspectorFindings, setInspectorFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sh, gd, cfg, insp] = await Promise.all([
        api.fetchSecurityHubFindings(100),
        api.fetchGuardDutyFindings(50),
        api.fetchConfigRules(),
        api.fetchInspectorFindings()
      ]);
      setSecurityHubFindings(sh.findings || []);
      setGuardDutyFindings(gd.findings || []);
      setConfigRules(cfg.rules || []);
      setInspectorFindings(insp.findings || []);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'securityhub', label: 'Security Hub', icon: Shield, count: securityHubFindings.length },
    { id: 'guardduty', label: 'GuardDuty', icon: Radar, count: guardDutyFindings.length },
    { id: 'config', label: 'Config Rules', icon: Settings, count: configRules.length },
    { id: 'inspector', label: 'Inspector', icon: Search, count: inspectorFindings.length }
  ];

  const getSeverityColor = (severity: string | number) => {
    const sev = typeof severity === 'number' ? 
      (severity >= 7 ? 'CRITICAL' : severity >= 4 ? 'HIGH' : 'MEDIUM') :
      severity?.toUpperCase();
    
    switch (sev) {
      case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'LOW': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getComplianceColor = (status: string) => {
    return status === 'COMPLIANT' 
      ? 'bg-green-400/10 text-green-400'
      : 'bg-red-400/10 text-red-400';
  };

  const filteredFindings = securityHubFindings.filter(f => 
    severityFilter === 'all' || f.severity?.toUpperCase() === severityFilter.toUpperCase()
  );

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
          <ShieldAlert className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Security</h1>
            <p className="text-gray-400">AWS security services overview</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Content */}
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
              <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Security Hub Tab */}
        {activeTab === 'securityhub' && (
          <div>
            {/* Filter */}
            <div className="p-4 border-b border-gray-700 flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <span className="text-gray-400 text-sm">
                {filteredFindings.length} findings
              </span>
            </div>

            {/* Findings List */}
            <div className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto">
              {filteredFindings.map((finding) => (
                <div key={finding.id} className="p-4 hover:bg-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          finding.status === 'RESOLVED' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                        }`}>
                          {finding.status}
                        </span>
                      </div>
                      <p className="text-white">{finding.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>{finding.resource_type}</span>
                        <span>•</span>
                        <span>{finding.region}</span>
                        <span>•</span>
                        <span>{new Date(finding.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GuardDuty Tab */}
        {activeTab === 'guardduty' && (
          <div className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto">
            {guardDutyFindings.map((finding) => (
              <div key={finding.id} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                        {typeof finding.severity === 'number' ? `${finding.severity.toFixed(1)}` : finding.severity}
                      </span>
                    </div>
                    <p className="text-white font-medium">{finding.type}</p>
                    <p className="text-gray-400 text-sm mt-1">{finding.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>Resource: {finding.resource}</span>
                      <span>•</span>
                      <span>{new Date(finding.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Config Rules Tab */}
        {activeTab === 'config' && (
          <div className="divide-y divide-gray-700">
            {configRules.map((rule, index) => (
              <div key={index} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{rule.name}</p>
                    <p className="text-gray-400 text-sm">{rule.resources} resources evaluated</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${getComplianceColor(rule.compliance)}`}>
                    {rule.compliance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inspector Tab */}
        {activeTab === 'inspector' && (
          <div className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto">
            {inspectorFindings.map((finding) => (
              <div key={finding.id} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <span className="text-blue-400 font-mono text-sm">{finding.cve_id}</span>
                </div>
                <p className="text-white">{finding.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>{finding.resource_type}</span>
                  <span>•</span>
                  <span>CVSS: {finding.cvss_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
