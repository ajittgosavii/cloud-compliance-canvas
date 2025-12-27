import React, { useState, useEffect } from 'react';
import { 
  Bug, RefreshCw, AlertTriangle, Shield, Box, Server,
  TrendingDown, Clock, ExternalLink, Filter
} from 'lucide-react';
import * as api from '../services/api';

export default function VulnerabilitiesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [eksData, setEksData] = useState<any>(null);
  const [containerData, setContainerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, eks, containers] = await Promise.all([
        api.fetchVulnerabilitiesOverview(),
        api.fetchEKSVulnerabilities(),
        api.fetchContainerVulnerabilities()
      ]);
      setOverview(overviewData);
      setEksData(eks);
      setContainerData(containers);
    } catch (error) {
      console.error('Failed to load vulnerabilities:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'inspector', label: 'AWS Inspector', icon: Server },
    { id: 'eks', label: 'EKS Clusters', icon: Box },
    { id: 'containers', label: 'Containers', icon: Box }
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

  const filteredVulnerabilities = overview?.vulnerabilities?.filter((v: any) => 
    severityFilter === 'all' || v.severity?.toUpperCase() === severityFilter.toUpperCase()
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="w-8 h-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Vulnerabilities</h1>
            <p className="text-gray-400">Security vulnerability management</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Vulnerabilities</p>
            <p className="text-3xl font-bold text-white">{overview.total}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-red-500/30">
            <p className="text-gray-400 text-sm">Critical</p>
            <p className="text-3xl font-bold text-red-400">{overview.by_severity?.CRITICAL || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-orange-500/30">
            <p className="text-gray-400 text-sm">High</p>
            <p className="text-3xl font-bold text-orange-400">{overview.by_severity?.HIGH || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">MTTR (Days)</p>
            <p className="text-3xl font-bold text-blue-400">{overview.mttr_days}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* By Source */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">By Source</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(overview.by_source || {}).map(([source, count]) => (
                <div key={source} className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">{source}</p>
                  <p className="text-2xl font-bold text-white">{count as number}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-medium">Remediation Rate</h4>
              </div>
              <p className="text-3xl font-bold text-green-400">{overview.remediation_rate}%</p>
              <p className="text-gray-400 text-sm mt-1">of vulnerabilities remediated</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-medium">Mean Time to Remediate</h4>
              </div>
              <p className="text-3xl font-bold text-blue-400">{overview.mttr_days} days</p>
              <p className="text-gray-400 text-sm mt-1">average resolution time</p>
            </div>
          </div>

          {/* Vulnerabilities List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">All Vulnerabilities</h3>
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
            </div>
            <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
              {filteredVulnerabilities.slice(0, 50).map((vuln: any) => (
                <div key={vuln.id} className="p-4 hover:bg-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                        <span className="text-blue-400 font-mono text-sm">{vuln.cve_id}</span>
                      </div>
                      <p className="text-white">{vuln.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>Source: {vuln.source}</span>
                        <span>Package: {vuln.package}</span>
                        <span>CVSS: {vuln.cvss_score}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      vuln.status === 'ACTIVE' ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'
                    }`}>
                      {vuln.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspector Tab */}
      {activeTab === 'inspector' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">AWS Inspector Findings</h3>
          </div>
          <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
            {overview?.vulnerabilities?.filter((v: any) => v.source === 'Inspector').map((vuln: any) => (
              <div key={vuln.id} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                  <span className="text-blue-400 font-mono text-sm">{vuln.cve_id}</span>
                  <span className="text-gray-500">CVSS: {vuln.cvss_score}</span>
                </div>
                <p className="text-white">{vuln.title}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Resource: {vuln.resource_type} - {vuln.resource_id}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-gray-500">Package: {vuln.package}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-green-400">Fix: {vuln.fixed_version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EKS Tab */}
      {activeTab === 'eks' && eksData && (
        <div className="space-y-6">
          {eksData.clusters?.map((cluster: any) => (
            <div key={cluster.cluster} className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{cluster.cluster}</h3>
                  <p className="text-gray-400 text-sm">
                    {cluster.total} vulnerabilities • {cluster.critical} critical
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-400/10 text-red-400 rounded-full text-sm">
                    {cluster.critical} Critical
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-700 max-h-80 overflow-y-auto">
                {cluster.vulnerabilities?.slice(0, 10).map((vuln: any) => (
                  <div key={vuln.id} className="p-4 hover:bg-gray-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                      <span className="text-blue-400 font-mono text-sm">{vuln.cve_id}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-400">
                      <span>Namespace: {vuln.namespace}</span>
                      <span>Pod: {vuln.pod}</span>
                      <span>Container: {vuln.container}</span>
                      <span>Package: {vuln.package}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Containers Tab */}
      {activeTab === 'containers' && containerData && (
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Container Vulnerabilities ({containerData.total})
            </h3>
          </div>
          <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
            {containerData.vulnerabilities?.map((vuln: any) => (
              <div key={vuln.id} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                  <span className="text-blue-400 font-mono text-sm">{vuln.cve_id}</span>
                </div>
                <p className="text-white">{vuln.title}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {vuln.resource_type}: {vuln.resource_id}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-gray-500">Package: {vuln.package}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">Installed: {vuln.installed_version}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-green-400">Fix: {vuln.fixed_version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
