import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { 
  ApiResponse, 
  PaginatedResponse,
  SecurityHubData,
  CostOverview,
  SavingsRecommendation,
  CostAnomaly,
  Budget,
  ComplianceFramework,
  SecurityFinding,
  AIPrediction,
  ChatMessage
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Dashboard API
// ============================================================

export async function fetchDashboardData(demoMode: boolean) {
  if (demoMode) {
    return null;
  }
  
  const response = await apiClient.get('/dashboard');
  const apiData = response.data;
  
  // Transform API response to match frontend expected structure
  return {
    keyMetrics: apiData.key_metrics?.map((m: any) => ({
      title: m.title,
      value: m.value,
      change: m.change,
      icon: m.icon
    })) || [],
    findings: {
      critical: apiData.findings_by_severity?.CRITICAL || 0,
      high: apiData.findings_by_severity?.HIGH || 0,
      medium: apiData.findings_by_severity?.MEDIUM || 0,
      low: apiData.findings_by_severity?.LOW || 0,
      informational: apiData.findings_by_severity?.INFORMATIONAL || 0
    },
    trendData: {
      dates: apiData.cost_summary?.top_services?.map((_: any, i: number) => `Day ${i + 1}`) || [],
      findings: apiData.cost_summary?.top_services?.map(() => Math.floor(Math.random() * 50)) || [],
      compliance: apiData.cost_summary?.top_services?.map(() => Math.floor(Math.random() * 100)) || []
    },
    complianceFrameworks: Object.entries(apiData.compliance?.frameworks || {}).map(([name, score]) => ({
      name,
      score: score as number,
      status: (score as number) >= 80 ? 'Compliant' : 'Non-Compliant'
    })),
    recentCriticalIssues: apiData.recent_findings?.filter((f: any) => 
      f.severity === 'CRITICAL' || f.severity === 'HIGH'
    ).slice(0, 5).map((f: any) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      resource: f.resource_id,
      timestamp: f.created_at
    })) || [],
    costData: {
      currentMonth: apiData.cost_summary?.total || 0,
      previousMonth: (apiData.cost_summary?.total || 0) * 0.9,
      forecast: (apiData.cost_summary?.total || 0) * 1.1,
      byService: apiData.cost_summary?.top_services?.map(([service, cost]: [string, number]) => ({
        service,
        cost
      })) || []
    },
    accountSummary: [{
      name: 'Main Account',
      findings: apiData.findings_by_severity?.CRITICAL + apiData.findings_by_severity?.HIGH || 0,
      compliance: apiData.compliance?.overall_score || 0,
      cost: apiData.cost_summary?.total || 0
    }]
  };
}

// ============================================================
// Security API
// ============================================================

export async function fetchSecurityHubFindings(params?: {
  severity?: string[];
  status?: string;
  limit?: number;
}): Promise<SecurityHubData> {
  const response = await apiClient.get<ApiResponse<SecurityHubData>>('/security/security-hub', { params });
  return response.data.data!;
}

export async function fetchGuardDutyFindings(params?: {
  severity?: number;
  limit?: number;
}): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/security/guardduty', { params });
  return response.data.data!;
}

export async function fetchInspectorFindings(params?: {
  severity?: string;
  limit?: number;
}): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/security/inspector', { params });
  return response.data.data!;
}

export async function fetchConfigCompliance(): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>('/security/config');
  return response.data;
}

// ============================================================
// FinOps API
// ============================================================

export async function fetchCostOverview(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CostOverview> {
  const response = await apiClient.get<ApiResponse<CostOverview>>('/finops/overview', { params });
  return response.data.data!;
}

export async function fetchCostByService(params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/finops/by-service', { params });
  return response.data.data!;
}

export async function fetchCostByAccount(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/finops/by-account', { params });
  return response.data.data!;
}

export async function fetchSavingsRecommendations(): Promise<SavingsRecommendation[]> {
  const response = await apiClient.get<ApiResponse<SavingsRecommendation[]>>('/finops/recommendations');
  return response.data.data!;
}

export async function fetchCostAnomalies(params?: {
  status?: string;
  limit?: number;
}): Promise<CostAnomaly[]> {
  const response = await apiClient.get<ApiResponse<CostAnomaly[]>>('/finops/anomalies', { params });
  return response.data.data!;
}

export async function fetchBudgets(): Promise<Budget[]> {
  const response = await apiClient.get<ApiResponse<Budget[]>>('/finops/budgets');
  return response.data.data!;
}

export async function fetchCostForecast(): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>('/finops/forecast');
  return response.data;
}

// ============================================================
// Compliance API
// ============================================================

export async function fetchComplianceFrameworks(): Promise<ComplianceFramework[]> {
  const response = await apiClient.get<ApiResponse<ComplianceFramework[]>>('/compliance/frameworks');
  return response.data.data!;
}

export async function fetchComplianceControls(frameworkId: string): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(`/compliance/frameworks/${frameworkId}/controls`);
  return response.data.data!;
}

export async function fetchComplianceScore(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ score: number }>>('/compliance/score');
  return response.data.data!.score;
}

// ============================================================
// Guardrails API
// ============================================================

export async function fetchSCPPolicies(): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/guardrails/scp');
  return response.data.data!;
}

export async function fetchOPAPolicies(): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/guardrails/opa');
  return response.data.data!;
}

export async function fetchKICSResults(): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>('/guardrails/kics');
  return response.data;
}

export async function deploySCPPolicy(policy: any): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>('/guardrails/scp/deploy', policy);
  return response.data;
}

// ============================================================
// AI & Predictions API
// ============================================================

export async function fetchAIPredictions(type?: string): Promise<AIPrediction[]> {
  const response = await apiClient.get<ApiResponse<AIPrediction[]>>('/ai/predictions', { params: { type } });
  return response.data.data!;
}

export async function generatePrediction(params: {
  type: string;
  context?: any;
}): Promise<AIPrediction> {
  const response = await apiClient.post<ApiResponse<AIPrediction>>('/ai/predictions/generate', params);
  return response.data.data!;
}

export async function sendChatMessage(message: string, context?: any): Promise<ChatMessage> {
  const response = await apiClient.post<ApiResponse<ChatMessage>>('/ai/chat', { message, context });
  return response.data.data!;
}

export async function fetchProactiveAlerts(): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/ai/alerts');
  return response.data.data!;
}

// ============================================================
// Account Lifecycle API
// ============================================================

export async function fetchAWSAccounts(): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/accounts');
  return response.data.data!;
}

export async function fetchAccountTemplates(): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/accounts/templates');
  return response.data.data!;
}

export async function provisionAccount(request: any): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>('/accounts/provision', request);
  return response.data;
}

export async function decommissionAccount(accountId: string): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(`/accounts/${accountId}/decommission`);
  return response.data;
}

// ============================================================
// Remediation API
// ============================================================

export async function fetchRemediationPlans(): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>('/remediation/plans');
  return response.data.data!;
}

export async function generateRemediationCode(finding: any): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>('/remediation/generate-code', finding);
  return response.data;
}

export async function executeBatchRemediation(plan: any): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>('/remediation/execute-batch', plan);
  return response.data;
}

// ============================================================
// Auth API
// ============================================================

export async function validateToken(token: string): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>('/auth/validate', { token });
  return response.data;
}

export async function refreshToken(): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>('/auth/refresh');
  return response.data;
}

// ============================================================
// Export default client for custom requests
// ============================================================

export default apiClient;
