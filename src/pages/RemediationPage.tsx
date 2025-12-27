import React, { useState, useEffect } from 'react';
import {
  fetchRemediationThreats,
  fetchRemediationHistory,
  fetchGitOpsStatus,
  fetchGitOpsDetection,
  generateRemediationCode,
  executeBatchRemediation
} from '../services/api';

type TabType = 'threats' | 'code-gen' | 'batch' | 'gitops-status' | 'gitops-detection' | 'history';

export default function RemediationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('threats');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});
  const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [codeLanguage, setCodeLanguage] = useState<string>('terraform');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'threats', label: 'AI Analysis', icon: '🔍' },
    { id: 'code-gen', label: 'Code Generation', icon: '💻' },
    { id: 'batch', label: 'Batch Remediation', icon: '⚡' },
    { id: 'gitops-status', label: 'GitOps Status', icon: '📊' },
    { id: 'gitops-detection', label: 'Drift Detection', icon: '🔍' },
    { id: 'history', label: 'History', icon: '📜' },
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    try {
      let result;
      switch (tab) {
        case 'threats': result = await fetchRemediationThreats(); break;
        case 'history': result = await fetchRemediationHistory(); break;
        case 'gitops-status': result = await fetchGitOpsStatus(); break;
        case 'gitops-detection': result = await fetchGitOpsDetection(); break;
      }
      if (result) setData(prev => ({ ...prev, [tab]: result }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleGenerateCode = async (findingId: string, findingType: string) => {
    setLoading(true);
    try {
      const result = await generateRemediationCode({
        finding_id: findingId,
        finding_type: findingType,
        language: codeLanguage
      });
      setGeneratedCode(result.code || '');
      setActiveTab('code-gen');
    } catch (error) {
      console.error('Error generating code:', error);
    }
    setLoading(false);
  };

  const handleBatchRemediation = async () => {
    if (selectedThreats.length === 0) return;
    setLoading(true);
    try {
      await executeBatchRemediation({
        finding_ids: selectedThreats,
        approval_required: true
      });
      alert('Batch remediation submitted for approval');
      setSelectedThreats([]);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const renderThreats = () => {
    const d = data.threats;
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Available Threats for Remediation</h3>
            {selectedThreats.length > 0 && (
              <button
                onClick={handleBatchRemediation}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Remediate Selected ({selectedThreats.length})
              </button>
            )}
          </div>
          <div className="space-y-3">
            {d.threats?.map((threat: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedThreats.includes(threat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedThreats([...selectedThreats, threat.id]);
                    } else {
                      setSelectedThreats(selectedThreats.filter(id => id !== threat.id));
                    }
                  }}
                  className="w-5 h-5"
                />
                <span className={`px-2 py-1 rounded text-white text-sm ${
                  threat.severity === 'CRITICAL' ? 'bg-red-500' :
                  threat.severity === 'HIGH' ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}>{threat.severity}</span>
                <div className="flex-1">
                  <div className="font-medium">{threat.type}</div>
                  <div className="text-sm text-gray-500">{threat.resource}</div>
                </div>
                <div className="text-sm text-gray-500">{threat.confidence}% confidence</div>
                <button
                  onClick={() => handleGenerateCode(threat.id, threat.type)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Generate Code
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCodeGen = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-4">
          <select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="terraform">Terraform</option>
            <option value="cloudformation">CloudFormation</option>
            <option value="lambda">Lambda (Python)</option>
          </select>
        </div>
        
        {generatedCode ? (
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              {generatedCode}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Copy
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Select a threat and click "Generate Code" to see remediation code
          </div>
        )}
      </div>
    </div>
  );

  const renderGitOpsStatus = () => {
    const d = data['gitops-status'];
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">Repository</div>
            <div className="text-indigo-600">{d.repository}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">Branch</div>
            <div>{d.branch}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">Sync Status</div>
            <span className={`px-2 py-1 rounded text-sm ${
              d.sync_status === 'synced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>{d.sync_status}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Deployments</h3>
          <div className="space-y-3">
            {d.deployments?.map((dep: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{dep.environment}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  dep.status === 'synced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{dep.status}</span>
                <span className="text-sm text-gray-500">{dep.last_deployed}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Recent Commits</h3>
          <div className="space-y-3">
            {d.recent_commits?.map((commit: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 border rounded">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{commit.sha}</code>
                <div className="flex-1">{commit.message}</div>
                <span className="text-sm text-gray-500">{commit.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGitOpsDetection = () => {
    const d = data['gitops-detection'];
    if (!d) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-indigo-600">{d.total_resources_monitored}</div>
            <div className="text-gray-500">Resources Monitored</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-green-600">{d.resources_in_sync}</div>
            <div className="text-gray-500">In Sync</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-red-600">{d.resources_drifted}</div>
            <div className="text-gray-500">Drifted</div>
          </div>
        </div>

        {d.drifts?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Detected Drifts</h3>
            <div className="space-y-3">
              {d.drifts.map((drift: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg border-l-4 border-l-red-500">
                  <div>
                    <div className="font-medium">{drift.resource}</div>
                    <div className="text-sm text-gray-500">Type: {drift.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Expected: <code className="bg-gray-100 px-1">{drift.expected}</code></div>
                    <div className="text-sm">Actual: <code className="bg-red-100 px-1">{drift.actual}</code></div>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    drift.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{drift.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => {
    const d = data.history;
    if (!d) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Remediation History</h3>
        <div className="space-y-3">
          {d.history?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{item.action}</div>
                <div className="text-sm text-gray-500">{item.id}</div>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>{item.status}</span>
              <span className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🤖 Remediation</h1>
      
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
          {activeTab === 'threats' && renderThreats()}
          {activeTab === 'code-gen' && renderCodeGen()}
          {activeTab === 'batch' && renderThreats()}
          {activeTab === 'gitops-status' && renderGitOpsStatus()}
          {activeTab === 'gitops-detection' && renderGitOpsDetection()}
          {activeTab === 'history' && renderHistory()}
        </>
      )}
    </div>
  );
}
