/**
 * Cloud Compliance Canvas - API Service v4.0.0
 * With Demo/Live Mode Support and AWS Organizations
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://72lbusissjfm3mm2fjplcst3gm0tgkve.lambda-url.us-east-1.on.aws/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// ============================================================================
// CONFIGURATION & MODE
// ============================================================================

export const fetchHealth = () => apiClient.get('/health');
export const fetchConfig = () => apiClient.get('/config');
export const setDemoMode = (demoMode: boolean) => 
  apiClient.post('/config/mode', { demo_mode: demoMode });

// ============================================================================
// DASHBOARD
// ============================================================================

export const fetchDashboard = () => apiClient.get('/dashboard');

// ============================================================================
// ACCOUNTS / AWS ORGANIZATIONS
// ============================================================================

export const fetchAccounts = (params?: { environment?: string; status?: string; limit?: number }) =>
  apiClient.get('/accounts', { params });

export const fetchAccountTemplates = () => apiClient.get('/accounts/templates');

export const fetchAccountDetails = (accountId: string) =>
  apiClient.get(`/accounts/${accountId}`);

export const provisionAccount = (data: {
  account_name: string;
  account_email: string;
  template: string;
  environment: string;
  cost_center?: string;
  owner?: string;
}) => apiClient.post('/accounts/provision', data);

export const decommissionAccount = (data: { account_id: string; reason?: string }) =>
  apiClient.post('/accounts/decommission', data);

// ============================================================================
// SECURITY
// ============================================================================

export const fetchSecurityFindings = (params?: { severity?: string; status?: string; limit?: number }) =>
  apiClient.get('/security/findings', { params });

export const fetchSecurityHubFindings = (limit?: number) =>
  apiClient.get('/security/security-hub', { params: { limit } });

export const fetchGuardDutyFindings = (limit?: number) =>
  apiClient.get('/security/guardduty', { params: { limit } });

export const fetchConfigRules = () => apiClient.get('/security/config');

export const fetchInspectorFindings = () => apiClient.get('/security/inspector');

// ============================================================================
// COMPLIANCE
// ============================================================================

export const fetchComplianceScore = () => apiClient.get('/compliance/score');

export const fetchUnifiedCompliance = () => apiClient.get('/compliance/unified');

export const fetchComplianceFrameworks = () => apiClient.get('/compliance/frameworks');

export const fetchComplianceHistory = (days?: number) =>
  apiClient.get('/compliance/history', { params: { days } });

// ============================================================================
// VULNERABILITIES
// ============================================================================

export const fetchVulnerabilitiesOverview = () => apiClient.get('/vulnerabilities/overview');

export const fetchInspectorVulnerabilities = () => apiClient.get('/vulnerabilities/inspector');

export const fetchEKSVulnerabilities = () => apiClient.get('/vulnerabilities/eks');

export const fetchContainerVulnerabilities = () => apiClient.get('/vulnerabilities/containers');

// ============================================================================
// GUARDRAILS
// ============================================================================

export const fetchSCPPolicies = () => apiClient.get('/guardrails/scp');

export const fetchOPAPolicies = () => apiClient.get('/guardrails/opa');

export const fetchKICSResults = () => apiClient.get('/guardrails/kics');

export const fetchGuardrailViolations = () => apiClient.get('/guardrails/violations');

export const deployGuardrail = (data: {
  policy_type: string;
  policy_id: string;
  target_accounts?: string[];
  dry_run?: boolean;
}) => apiClient.post('/guardrails/deploy', data);

// ============================================================================
// REMEDIATION
// ============================================================================

export const fetchThreats = () => apiClient.get('/remediation/threats');

export const generateRemediationCode = (data: {
  finding_id: string;
  finding_type: string;
  language: string;
}) => apiClient.post('/remediation/generate-code', data);

export const executeBatchRemediation = (data: {
  finding_ids: string[];
  action: string;
  approval_required?: boolean;
}) => apiClient.post('/remediation/batch', data);

export const fetchRemediationHistory = (limit?: number) =>
  apiClient.get('/remediation/history', { params: { limit } });

export const rollbackRemediation = (data: { remediation_id: string }) =>
  apiClient.post('/remediation/rollback', data);

// ============================================================================
// FINOPS
// ============================================================================

export const fetchFinOpsOverview = () => apiClient.get('/finops/overview');

export const fetchCostByService = () => apiClient.get('/finops/by-service');

export const fetchCostByAccount = () => apiClient.get('/finops/by-account');

export const fetchBudgets = () => apiClient.get('/finops/budgets');

export const fetchCostAnomalies = () => apiClient.get('/finops/anomalies');

export const fetchSavingsRecommendations = () => apiClient.get('/finops/savings');

export const fetchUnitEconomics = () => apiClient.get('/finops/unit-economics');

export const fetchSustainability = () => apiClient.get('/finops/sustainability');

// ============================================================================
// AI
// ============================================================================

export const fetchExecutiveDashboard = () => apiClient.get('/ai/executive-dashboard');

export const fetchAIPrediction = (predictionType: string) =>
  apiClient.get(`/ai/predictions/${predictionType}`);

export const fetchProactiveAlerts = () => apiClient.get('/ai/alerts');

export const chatWithAI = (data: {
  messages: Array<{ role: string; content: string }>;
  context?: string;
}) => apiClient.post('/ai/chat', data);

// ============================================================================
// INTEGRATIONS
// ============================================================================

export const createJiraTicket = (data: { title: string; description: string; project?: string; priority?: string }) =>
  apiClient.post('/integrations/jira', { payload: data });

export const sendSlackNotification = (data: { channel: string; message: string }) =>
  apiClient.post('/integrations/slack', { payload: data });

export const createServiceNowIncident = (data: { title: string; description: string; priority?: string }) =>
  apiClient.post('/integrations/servicenow', { payload: data });

export const triggerPagerDuty = (data: { title: string; severity: string }) =>
  apiClient.post('/integrations/pagerduty', { payload: data });

export const fetchGitHubSecurity = () => apiClient.get('/integrations/github');

// ============================================================================
// AUTHENTICATION (Azure SSO)
// ============================================================================

export const loginWithAzure = (data: { token: string }) =>
  apiClient.post('/auth/azure', data);

export const logout = () => apiClient.post('/auth/logout');

export const fetchCurrentUser = () => apiClient.get('/auth/me');

// ============================================================================
// EXPORTS
// ============================================================================

export default apiClient;
