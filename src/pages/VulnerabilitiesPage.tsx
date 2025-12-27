import { useState, useEffect } from 'react';
import {
  fetchVulnerabilitiesOverview,
  fetchVulnerabilitiesInspector,
  fetchVulnerabilitiesEKS,
  fetchVulnerabilitiesContainers,
  fetchVulnerabilitiesSnyk,
  fetchVulnerabilitiesTrivy
} from '../services/api';

type TabType = 'overview' | 'inspector' | 'eks' | 'containers' | 'snyk' | 'trivy';

export default function VulnerabilitiesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'inspector', label: 'Inspector', icon: '🔬' },
    { id: 'eks', label: 'EKS', icon: '☸️' },
    { id: 'containers', label: 'Containers', icon: '🐳' },
    { id: 'snyk', label: 'Snyk', icon: '🔍' },
    { id: 'trivy', label: 'Trivy', icon: '🛡️' },
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    try {
      let result;
      switch (tab) {
        case 'overview': result = await fetchVulnerabilitiesOverview(); break;
        case 'inspector': result = await fetchVulnerabilitiesInspector(); break;
        case 'eks': result = await fetchVulnerabilitiesEKS(); break;
        case 'containers': result = await fetchVulnerabilitiesContainers(); break;
        case 'snyk': result = await fetchVulnerabilitiesSnyk(); break;
        case 'trivy': result = await fetchVulnerabilitiesTrivy(); break;
      }
      setData(prev => ({ ...prev, [tab]: result }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const renderOverview = () => {
    const d = data.overview;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-gray-800">{d.total}</div>
            <div className="text-gray-500">Total</div>
          </div>
          {Object.entries(d.by_severity || {}).map(([severity, count]) => (
            <div key={severity} className="bg-white rounded-lg shadow p-4">
              <div className={`text-3xl font-bold ${
                severity === 'CRITICAL' ? 'text-red-600' :
                severity === 'HIGH' ? 'text-orange-600' :
                severity === 'MEDIUM' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>{count as number}</div>
              <div className="text-gray-500">{severity}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Vulnerabilities by Source</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(d.by_source || {}).map(([source, count]) => (
              <div key={source} className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-indigo-600">{count as number}</div>
                <div className="text-gray-500">{source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSnyk = () => {
    const d = data.snyk;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold">{d.summary?.total_projects}</div>
            <div className="text-gray-500">Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-red-600">{d.summary?.critical}</div>
            <div className="text-gray-500">Critical</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{d.summary?.high}</div>
            <div className="text-gray-500">High</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-yellow-600">{d.summary?.medium}</div>
            <div className="text-gray-500">Medium</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-blue-600">{d.summary?.low}</div>
            <div className="text-gray-500">Low</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Projects</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Project</th>
                  <th className="text-right py-2">Critical</th>
                  <th className="text-right py-2">High</th>
                  <th className="text-right py-2">Medium</th>
                  <th className="text-right py-2">Low</th>
                  <th className="text-right py-2">Last Scan</th>
                </tr>
              </thead>
              <tbody>
                {d.projects?.map((project: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 font-medium">{project.name}</td>
                    <td className="py-2 text-right text-red-600">{project.critical}</td>
                    <td className="py-2 text-right text-orange-600">{project.high}</td>
                    <td className="py-2 text-right text-yellow-600">{project.medium}</td>
                    <td className="py-2 text-right text-blue-600">{project.low}</td>
                    <td className="py-2 text-right text-gray-500 text-sm">
                      {new Date(project.last_scan).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {d.top_vulnerabilities && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Top Vulnerabilities</h3>
            <div className="space-y-3">
              {d.top_vulnerabilities.map((vuln: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{vuln.id}</code>
                    <span className="ml-2 text-gray-600">in {vuln.package}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{vuln.affected_projects} projects</span>
                    <span className={`px-2 py-1 rounded text-white text-sm ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTrivy = () => {
    const d = data.trivy;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold">{d.summary?.total_images}</div>
            <div className="text-gray-500">Images</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-red-600">{d.summary?.critical}</div>
            <div className="text-gray-500">Critical</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{d.summary?.high}</div>
            <div className="text-gray-500">High</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-green-600">{d.summary?.fixable}</div>
            <div className="text-gray-500">Fixable</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Container Images</h3>
          <div className="space-y-3">
            {d.images?.map((image: any, idx: number) => (
              <div key={idx} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{image.image}</span>
                    <span className="ml-2 text-sm text-gray-500">{image.os}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-red-600">Critical: {image.critical}</span>
                  <span className="text-orange-600">High: {image.high}</span>
                  <span className="text-yellow-600">Medium: {image.medium}</span>
                  <span className="text-blue-600">Low: {image.low}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {d.misconfigurations && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Misconfigurations</h3>
            <div className="space-y-3">
              {d.misconfigurations.map((misc: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{misc.type}</span>
                    <span className="ml-2 text-gray-600">{misc.message}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{misc.affected_images} images</span>
                    <span className={`px-2 py-1 rounded text-white text-sm ${getSeverityColor(misc.severity)}`}>
                      {misc.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEKS = () => {
    const d = data.eks;
    if (!d) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">EKS Clusters</h3>
        <div className="space-y-4">
          {d.clusters?.map((cluster: any, idx: number) => (
            <div key={idx} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">{cluster.cluster}</span>
                <div className="flex gap-4">
                  <span className="text-red-600 font-bold">{cluster.critical} critical</span>
                  <span className="text-gray-600">{cluster.total} total</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔬 Vulnerabilities</h1>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'snyk' && renderSnyk()}
          {activeTab === 'trivy' && renderTrivy()}
          {activeTab === 'eks' && renderEKS()}
          {activeTab === 'inspector' && <div className="text-gray-500">Inspector findings will appear here</div>}
          {activeTab === 'containers' && <div className="text-gray-500">Container vulnerabilities will appear here</div>}
        </>
      )}
    </div>
  );
}
