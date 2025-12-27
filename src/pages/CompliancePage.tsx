import { useState, useEffect } from 'react';
import {
  fetchComplianceScore,
  fetchComplianceFrameworks,
  fetchComplianceUnified,
  fetchComplianceControls
} from '../services/api';

export default function CompliancePage() {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<any>(null);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [unified, setUnified] = useState<any>(null);
  const [controls, setControls] = useState<any>(null);
  const [selectedFramework, setSelectedFramework] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scoreData, frameworksData, unifiedData, controlsData] = await Promise.all([
        fetchComplianceScore(),
        fetchComplianceFrameworks(),
        fetchComplianceUnified(),
        fetchComplianceControls()
      ]);
      setScore(scoreData);
      setFrameworks(frameworksData.frameworks || []);
      setUnified(unifiedData);
      setControls(controlsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🎯 Compliance</h1>

      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-2">
          <div className="flex items-center gap-6">
            <div className={`text-6xl font-bold ${getScoreColor(score?.score || 0)}`}>
              {score?.score || 0}%
            </div>
            <div>
              <div className="text-xl font-semibold">Overall Compliance Score</div>
              <div className={`text-sm ${score?.trend === 'improving' ? 'text-green-600' : 'text-red-600'}`}>
                {score?.trend === 'improving' ? '↑ Improving' : '↓ Declining'}
              </div>
            </div>
          </div>
        </div>

        {unified?.sources && Object.entries(unified.sources).map(([source, data]: [string, any]) => (
          <div key={source} className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">{source}</div>
            <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>{data.score}%</div>
            <div className="text-sm text-gray-500">{data.findings || data.rules || 0} items</div>
          </div>
        ))}
      </div>

      {/* Frameworks */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">Compliance Frameworks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map((fw, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedFramework === fw.name 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedFramework(fw.name === selectedFramework ? '' : fw.name)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{fw.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  fw.status === 'Compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {fw.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${getScoreColor(fw.score)}`}>{fw.score}%</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBg(fw.score).replace('bg-', 'bg-').replace('-100', '-500')}`}
                      style={{ width: `${fw.score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {fw.passed}/{fw.total_controls} controls passed
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Detail */}
      {controls?.frameworks && selectedFramework && controls.frameworks[selectedFramework] && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">{selectedFramework} Controls</h3>
          <div className="space-y-3">
            {controls.frameworks[selectedFramework].controls?.map((control: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-2">{control.id}</span>
                  <span>{control.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{control.evidence} evidence items</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    control.status === 'COMPLIANT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {control.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
