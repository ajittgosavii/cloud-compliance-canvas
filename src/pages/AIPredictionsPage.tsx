import { useState, useEffect } from 'react';
import { 
  fetchAIExecutiveDashboard, 
  fetchAIPrediction, 
  fetchAIAlerts,
  sendAIChat 
} from '../services/api';

type TabType = 'executive' | 'chat' | 'cost' | 'security' | 'compliance' | 'operations' | 'alerts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIPredictionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('executive');
  const [loading, setLoading] = useState(false);
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [predictions, setPredictions] = useState<Record<string, any>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'executive', label: 'Executive Dashboard', icon: '📊' },
    { id: 'chat', label: 'AI Chat Assistant', icon: '💬' },
    { id: 'cost', label: 'Cost Predictions', icon: '💰' },
    { id: 'security', label: 'Security Predictions', icon: '🛡️' },
    { id: 'compliance', label: 'Compliance Predictions', icon: '📋' },
    { id: 'operations', label: 'Operations Predictions', icon: '⚙️' },
    { id: 'alerts', label: 'Proactive Alerts', icon: '⚡' },
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    try {
      if (tab === 'executive') {
        const data = await fetchAIExecutiveDashboard();
        setExecutiveData(data);
      } else if (tab === 'alerts') {
        const data = await fetchAIAlerts();
        setAlerts(data.alerts || []);
      } else if (['cost', 'security', 'compliance', 'operations'].includes(tab)) {
        const data = await fetchAIPrediction(tab as any);
        setPredictions(prev => ({ ...prev, [tab]: data }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');
    
    try {
      const response = await sendAIChat(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  const renderExecutiveDashboard = () => (
    <div className="space-y-6">
      {executiveData && (
        <>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Executive Summary</h3>
            <p className="text-lg opacity-90">{executiveData.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-indigo-600">{executiveData.risk_score}/100</div>
              <div className="text-gray-500">Risk Score</div>
              <div className={`text-sm ${executiveData.risk_trend === 'decreasing' ? 'text-green-500' : 'text-red-500'}`}>
                {executiveData.risk_trend === 'decreasing' ? '↓ Improving' : '↑ Needs Attention'}
              </div>
            </div>
          </div>

          {executiveData.key_insights && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-4">Key Insights</h4>
              <div className="space-y-3">
                {executiveData.key_insights.map((insight: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <span className={`w-3 h-3 rounded-full ${
                      insight.status === 'on_track' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="font-medium">{insight.category}:</span>
                    <span className="text-gray-600">{insight.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderChatAssistant = () => (
    <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">👋 Hi! I'm your AI Cloud Assistant</p>
            <p>Ask me anything about your AWS environment, costs, security, or compliance.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about your cloud environment..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  );

  const renderPrediction = (type: string) => {
    const data = predictions[type];
    if (!data) return <div className="text-gray-500">Loading predictions...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {type === 'cost' && (
            <>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">${data.next_month_forecast?.toLocaleString()}</div>
                <div className="text-gray-500">Next Month Forecast</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-indigo-600">{(data.confidence * 100).toFixed(0)}%</div>
                <div className="text-gray-500">Confidence</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className={`text-2xl font-bold ${data.trend === 'increasing' ? 'text-red-500' : 'text-green-500'}`}>
                  {data.trend === 'increasing' ? '↑' : '↓'} {data.trend}
                </div>
                <div className="text-gray-500">Trend</div>
              </div>
            </>
          )}
          {type === 'security' && (
            <>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-orange-600">{data.risk_score}/100</div>
                <div className="text-gray-500">Risk Score</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-red-600">{data.predicted_incidents}</div>
                <div className="text-gray-500">Predicted Incidents</div>
              </div>
            </>
          )}
          {type === 'compliance' && (
            <>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">{data.projected_score}%</div>
                <div className="text-gray-500">Projected Score</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-yellow-600">{data.at_risk_controls}</div>
                <div className="text-gray-500">At-Risk Controls</div>
              </div>
            </>
          )}
          {type === 'operations' && (
            <>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-orange-600">{data.predicted_incidents}</div>
                <div className="text-gray-500">Predicted Incidents</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-indigo-600">{data.deployment_risk_score}/100</div>
                <div className="text-gray-500">Deployment Risk</div>
              </div>
            </>
          )}
        </div>

        {data.recommendations && (
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">AI Recommendations</h4>
            <ul className="space-y-2">
              {data.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No proactive alerts at this time</div>
      ) : (
        alerts.map((alert, idx) => (
          <div key={idx} className={`bg-white rounded-lg shadow p-4 border-l-4 ${
            alert.severity === 'critical' ? 'border-red-500' :
            alert.severity === 'high' ? 'border-orange-500' :
            'border-yellow-500'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{alert.title}</h4>
                <p className="text-gray-600 mt-1">{alert.message}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-gray-100 rounded text-sm">{alert.category}</span>
              </div>
              <span className={`px-2 py-1 rounded text-sm text-white ${
                alert.severity === 'critical' ? 'bg-red-500' :
                alert.severity === 'high' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}>
                {alert.severity}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔮 AI Predictions</h1>
      
      {/* Tabs */}
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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'executive' && renderExecutiveDashboard()}
          {activeTab === 'chat' && renderChatAssistant()}
          {activeTab === 'cost' && renderPrediction('cost')}
          {activeTab === 'security' && renderPrediction('security')}
          {activeTab === 'compliance' && renderPrediction('compliance')}
          {activeTab === 'operations' && renderPrediction('operations')}
          {activeTab === 'alerts' && renderAlerts()}
        </>
      )}
    </div>
  );
}
