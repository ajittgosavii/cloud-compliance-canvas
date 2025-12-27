import { useState, useEffect } from 'react';
import { 
  Wrench, AlertTriangle, Code, History, PlayCircle, RefreshCw,
  CheckCircle, XCircle, Clock, Copy, Download, RotateCcw
} from 'lucide-react';
import * as api from '../services/api';

interface RemediationPageProps {
  demoMode?: boolean;
}

export default function RemediationPage({ demoMode = true }: RemediationPageProps) {
  const [activeTab, setActiveTab] = useState('threats');
  const [threats, setThreats] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [codeLanguage, setCodeLanguage] = useState('terraform');
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [threatsData, historyData] = await Promise.all([
        api.fetchThreats(),
        api.fetchRemediationHistory(50)
      ]);
      setThreats(threatsData.threats || []);
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('Failed to load remediation data:', error);
    }
    setLoading(false);
  };

  const generateCode = async (threat: any) => {
    setGenerating(true);
    try {
      const result = await api.generateRemediationCode({
        finding_id: threat.id,
        finding_type: threat.type,
        resource_type: 'AWS::EC2::Instance',
        resource_id: threat.resource,
        language: codeLanguage
      });
      setGeneratedCode(result);
    } catch (error) {
      console.error('Code generation failed:', error);
    }
    setGenerating(false);
  };

  const executeBatchRemediation = async () => {
    if (selectedFindings.length === 0) return;
    
    try {
      const result = await api.executeBatchRemediation({
        finding_ids: selectedFindings,
        action: 'remediate',
        approval_required: true,
        notify: true
      });
      alert(`Batch remediation initiated: ${result.batch_id}`);
      setSelectedFindings([]);
      loadData();
    } catch (error) {
      console.error('Batch remediation failed:', error);
    }
  };

  const handleRollback = async (remediationId: string) => {
    try {
      await api.rollbackRemediation(remediationId);
      alert('Rollback initiated');
      loadData();
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  };

  const copyCode = () => {
    if (generatedCode?.code) {
      navigator.clipboard.writeText(generatedCode.code);
    }
  };

  const tabs = [
    { id: 'threats', label: 'Threat Analysis', icon: AlertTriangle },
    { id: 'codegen', label: 'Code Generation', icon: Code },
    { id: 'batch', label: 'Batch Remediation', icon: PlayCircle },
    { id: 'history', label: 'History', icon: History }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-400/10';
      case 'HIGH': return 'text-orange-400 bg-orange-400/10';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      case 'rolled_back': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Remediation Center</h1>
            <p className="text-gray-400">AI-powered threat analysis and remediation</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <div className="space-y-4">
          {threats.map((threat) => (
            <div key={threat.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <span className="text-white font-semibold">{threat.type}</span>
                    <span className="text-gray-500 text-sm">
                      Confidence: {threat.confidence}%
                    </span>
                  </div>
                  <p className="text-gray-400">{threat.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>Resource: {threat.resource}</span>
                    <span>Source: {threat.source}</span>
                    <span>Account: {threat.account_id}</span>
                  </div>
                  
                  {/* AI Analysis */}
                  {threat.ai_analysis && (
                    <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-purple-400 text-sm font-medium">AI Analysis</p>
                      <p className="text-gray-300 text-sm mt-1">{threat.ai_analysis}</p>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {threat.recommended_actions?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {threat.recommended_actions.map((action: string, i: number) => (
                          <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedThreat(threat);
                      setActiveTab('codegen');
                    }}
                    className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                  >
                    Generate Fix
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFindings([...selectedFindings, threat.id]);
                      setActiveTab('batch');
                    }}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Add to Batch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Generation Tab */}
      {activeTab === 'codegen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Generate Remediation Code</h3>
            
            {/* Language Selector */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Output Language</label>
              <div className="flex gap-2">
                {['terraform', 'cloudformation', 'python', 'bash'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      codeLanguage === lang
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Threat */}
            {selectedThreat ? (
              <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                <p className="text-gray-400 text-sm">Selected Threat:</p>
                <p className="text-white font-medium">{selectedThreat.type}</p>
                <p className="text-gray-400 text-sm">{selectedThreat.resource}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-700/50 rounded-lg mb-4 text-center">
                <p className="text-gray-400">Select a threat from the Threat Analysis tab</p>
              </div>
            )}

            <button
              onClick={() => selectedThreat && generateCode(selectedThreat)}
              disabled={!selectedThreat || generating}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  Generate Code
                </>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Generated Code</h3>
              {generatedCode && (
                <div className="flex gap-2">
                  <button
                    onClick={copyCode}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-300"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-300"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {generatedCode ? (
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <span>Language: {generatedCode.language}</span>
                  <span>•</span>
                  <span className="text-green-400">Validation: {generatedCode.validation_status}</span>
                </div>
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-96">
                  <code>{generatedCode.code}</code>
                </pre>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Generated code will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Remediation Tab */}
      {activeTab === 'batch' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Batch Remediation</h3>
            <button
              onClick={executeBatchRemediation}
              disabled={selectedFindings.length === 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Execute Batch ({selectedFindings.length})
            </button>
          </div>

          {/* Selected Findings */}
          {selectedFindings.length > 0 ? (
            <div className="space-y-3 mb-6">
              {selectedFindings.map((id) => {
                const threat = threats.find(t => t.id === id);
                return (
                  <div key={id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                    <div>
                      <p className="text-white">{threat?.type || id}</p>
                      <p className="text-gray-400 text-sm">{threat?.resource}</p>
                    </div>
                    <button
                      onClick={() => setSelectedFindings(selectedFindings.filter(f => f !== id))}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PlayCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No findings selected for batch remediation</p>
              <p className="text-sm mt-2">Go to Threat Analysis and add findings to the batch</p>
            </div>
          )}

          {/* Available Threats */}
          <div>
            <h4 className="text-white font-medium mb-3">Available Threats</h4>
            <div className="space-y-2">
              {threats.filter(t => !selectedFindings.includes(t.id)).slice(0, 10).map((threat) => (
                <div
                  key={threat.id}
                  className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <span className="text-gray-300">{threat.type}</span>
                  </div>
                  <button
                    onClick={() => setSelectedFindings([...selectedFindings, threat.id])}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Action</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Executed By</th>
                <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t border-gray-700">
                  <td className="p-4 text-gray-300 font-mono text-sm">{item.id}</td>
                  <td className="p-4 text-gray-300 capitalize">{item.action}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{item.executed_by}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(item.executed_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {item.status === 'completed' && (
                      <button
                        onClick={() => handleRollback(item.id)}
                        className="p-2 text-yellow-400 hover:text-yellow-300"
                        title="Rollback"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
