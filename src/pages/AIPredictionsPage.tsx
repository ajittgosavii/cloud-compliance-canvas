import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Shield, CheckCircle, Activity, AlertTriangle, 
  DollarSign, Send, RefreshCw, Zap, MessageSquare, BarChart3
} from 'lucide-react';
import * as api from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIPredictionsPage() {
  const [activeTab, setActiveTab] = useState('executive');
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [predictions, setPredictions] = useState<Record<string, any>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exec, costPred, secPred, compPred, opsPred, alertsData] = await Promise.all([
        api.fetchExecutiveDashboard(),
        api.fetchAIPrediction('cost'),
        api.fetchAIPrediction('security'),
        api.fetchAIPrediction('compliance'),
        api.fetchAIPrediction('operations'),
        api.fetchProactiveAlerts()
      ]);
      setExecutiveData(exec);
      setPredictions({ cost: costPred, security: secPred, compliance: compPred, operations: opsPred });
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Failed to load AI data:', error);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const newMessages: Message[] = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response = await api.sendAIChat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        'AWS cloud governance assistant'
      );
      setMessages([...newMessages, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setChatLoading(false);
  };

  const tabs = [
    { id: 'executive', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'cost', label: 'Cost Predictions', icon: DollarSign },
    { id: 'security', label: 'Security Predictions', icon: Shield },
    { id: 'compliance', label: 'Compliance Predictions', icon: CheckCircle },
    { id: 'operations', label: 'Operations', icon: Activity },
    { id: 'alerts', label: 'Proactive Alerts', icon: AlertTriangle }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': case 'critical': return 'text-red-400 bg-red-400/10';
      case 'medium': case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'attention_needed': return 'bg-red-500';
      case 'on_track': case 'good': return 'bg-green-500';
      default: return 'bg-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Command Center</h1>
            <p className="text-gray-400">AI-powered predictions and insights</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Executive Dashboard Tab */}
      {activeTab === 'executive' && executiveData && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
            <p className="text-gray-300">{executiveData.summary}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Risk Score:</span>
                <span className={`font-bold ${executiveData.risk_score < 30 ? 'text-green-400' : executiveData.risk_score < 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {executiveData.risk_score}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${executiveData.risk_trend === 'decreasing' ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-gray-400">{executiveData.risk_trend}</span>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {executiveData.key_insights?.map((insight: any, index: number) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{insight.category}</h4>
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(insight.status)}`}></span>
                </div>
                <p className="text-gray-300 mb-2">{insight.message}</p>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className={`w-4 h-4 ${insight.trend === 'improving' ? 'text-green-400' : 'text-yellow-400'}`} />
                  <span className="text-gray-400">{insight.trend}</span>
                </div>
                <p className="text-purple-400 text-sm mt-2">→ {insight.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Chat with Claude AI</h3>
            <p className="text-gray-400 text-sm">Ask about security, compliance, costs, or best practices</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with AI</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['What are my top security risks?', 'How can I optimize costs?', 'Show compliance status'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInputMessage(q)}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}>
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your AWS environment..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Tabs */}
      {['cost', 'security', 'compliance', 'operations'].includes(activeTab) && predictions[activeTab] && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">{activeTab} Prediction</h3>
            
            {activeTab === 'cost' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Next Month Forecast</p>
                    <p className="text-2xl font-bold text-white">${predictions.cost.next_month_forecast?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Confidence</p>
                    <p className="text-2xl font-bold text-green-400">{(predictions.cost.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Trend</p>
                    <p className="text-2xl font-bold text-yellow-400 capitalize">{predictions.cost.trend}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Contributing Factors</h4>
                  <ul className="space-y-2">
                    {predictions.cost.factors?.map((factor: string, i: number) => (
                      <li key={i} className="text-gray-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Risk Score</p>
                    <p className={`text-2xl font-bold ${predictions.security.risk_score < 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {predictions.security.risk_score}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Trend</p>
                    <p className="text-2xl font-bold text-gray-300 capitalize">{predictions.security.trend}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Predicted Findings</p>
                    <p className="text-2xl font-bold text-white">{predictions.security.predicted_findings}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Top Risks</h4>
                  <ul className="space-y-2">
                    {predictions.security.top_risks?.map((risk: string, i: number) => (
                      <li key={i} className="text-gray-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Projected Score</p>
                    <p className="text-2xl font-bold text-green-400">{predictions.compliance.projected_score}%</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Trend</p>
                    <p className="text-2xl font-bold text-green-400 capitalize">{predictions.compliance.trend}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">At-Risk Controls</p>
                    <p className="text-2xl font-bold text-yellow-400">{predictions.compliance.at_risk_controls}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Frameworks at Risk</h4>
                  <div className="flex gap-2">
                    {predictions.compliance.frameworks_at_risk?.map((fw: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-sm">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'operations' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Capacity Utilization</p>
                    <p className="text-2xl font-bold text-white">{predictions.operations.capacity_utilization}%</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Predicted Scaling Events</p>
                    <p className="text-2xl font-bold text-blue-400">{predictions.operations.scaling_events_predicted}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {predictions[activeTab].recommendations?.map((rec: string, i: number) => (
                  <li key={i} className="text-gray-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">No proactive alerts at this time</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{alert.title}</h4>
                      <p className="text-gray-400 mt-1">{alert.message}</p>
                      <p className="text-purple-400 text-sm mt-2">→ {alert.recommended_action}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
