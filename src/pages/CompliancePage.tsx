import { useState, useEffect } from 'react';
import { 
  CheckCircle, RefreshCw, AlertTriangle, TrendingUp, 
  FileText, Shield, Award, Clock, BarChart3
} from 'lucide-react';
import * as api from '../services/api';

interface CompliancePageProps {
  demoMode?: boolean;
}

export default function CompliancePage({ demoMode = true }: CompliancePageProps) {
  const [activeTab, setActiveTab] = useState('unified');
  const [unifiedData, setUnifiedData] = useState<any>(null);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unified, fw, hist] = await Promise.all([
        api.fetchUnifiedCompliance(),
        api.fetchComplianceFrameworks(),
        api.fetchComplianceHistory(30)
      ]);
      setUnifiedData(unified);
      setFrameworks(fw.frameworks || []);
      setHistory(hist.history || []);
    } catch (error) {
      console.error('Failed to load compliance:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'unified', label: 'Unified View', icon: Shield },
    { id: 'frameworks', label: 'Frameworks', icon: FileText },
    { id: 'history', label: 'Trends', icon: BarChart3 }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: string) => {
    return status === 'Compliant' 
      ? 'bg-green-400/10 text-green-400 border-green-400/30'
      : 'bg-red-400/10 text-red-400 border-red-400/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Compliance</h1>
            <p className="text-gray-400">Unified compliance monitoring</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {unifiedData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Overall Score</p>
            <p className={`text-4xl font-bold ${getScoreColor(unifiedData.overall_score)}`}>
              {unifiedData.overall_score}%
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Controls</p>
            <p className="text-4xl font-bold text-white">{unifiedData.total_controls}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-green-500/30">
            <p className="text-gray-400 text-sm">Passed</p>
            <p className="text-4xl font-bold text-green-400">{unifiedData.passed_controls}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-red-500/30">
            <p className="text-gray-400 text-sm">Failed</p>
            <p className="text-4xl font-bold text-red-400">{unifiedData.failed_controls}</p>
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
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Unified View Tab */}
      {activeTab === 'unified' && unifiedData && (
        <div className="space-y-6">
          {/* Sources */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance by Source</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(unifiedData.sources || {}).map(([source, data]: [string, any]) => (
                <div key={source} className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-xs mb-2">{source}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                    {data.score}%
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{data.findings} findings</p>
                </div>
              ))}
            </div>
          </div>

          {/* Frameworks Summary */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Framework Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frameworks.map((fw) => (
                <div 
                  key={fw.name}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{fw.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusBadge(fw.status)}`}>
                      {fw.status}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{fw.passed_controls}/{fw.total_controls} controls</span>
                      <span className={getScoreColor(fw.score)}>{fw.score}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          fw.score >= 90 ? 'bg-green-400' : fw.score >= 80 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${fw.score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{fw.category}</span>
                    <span className="text-gray-600">•</span>
                    <span className={`flex items-center gap-1 ${
                      fw.trend === 'improving' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {fw.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Frameworks Tab */}
      {activeTab === 'frameworks' && (
        <div className="space-y-4">
          {frameworks.map((fw) => (
            <div key={fw.name} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className={`w-6 h-6 ${getScoreColor(fw.score)}`} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{fw.name}</h3>
                    <p className="text-gray-400 text-sm">{fw.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getScoreColor(fw.score)}`}>{fw.score}%</p>
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusBadge(fw.status)}`}>
                    {fw.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">Total Controls</p>
                  <p className="text-xl font-bold text-white">{fw.total_controls}</p>
                </div>
                <div className="bg-green-400/10 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">Passed</p>
                  <p className="text-xl font-bold text-green-400">{fw.passed_controls}</p>
                </div>
                <div className="bg-red-400/10 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-xl font-bold text-red-400">{fw.failed_controls}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    fw.score >= 90 ? 'bg-green-400' : fw.score >= 80 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${fw.score}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last assessed: {new Date(fw.last_assessment).toLocaleDateString()}
                </span>
                <span className={`flex items-center gap-1 ${
                  fw.trend === 'improving' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {fw.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Compliance Trend (30 Days)</h3>
          
          {/* Simple trend visualization */}
          <div className="h-64 flex items-end gap-1">
            {history.map((day, index) => (
              <div 
                key={index}
                className="flex-1 flex flex-col items-center"
              >
                <div 
                  className={`w-full rounded-t ${
                    day.score >= 90 ? 'bg-green-400' : day.score >= 80 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ height: `${(day.score / 100) * 100}%` }}
                  title={`${day.date}: ${day.score}%`}
                ></div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <span>30 days ago</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-400"></div>
                ≥90%
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-400"></div>
                80-89%
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-400"></div>
                &lt;80%
              </span>
            </div>
            <span>Today</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-white">
                {(history.reduce((acc, d) => acc + d.score, 0) / history.length).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Highest</p>
              <p className="text-2xl font-bold text-green-400">
                {Math.max(...history.map(d => d.score))}%
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Lowest</p>
              <p className="text-2xl font-bold text-red-400">
                {Math.min(...history.map(d => d.score))}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
