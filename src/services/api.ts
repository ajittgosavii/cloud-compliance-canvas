import axios, { AxiosInstance } from 'axios';

// API Configuration - supports both Lambda Function URL and API Gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://72lbusissjfm3mm2fjplcst3gm0tgkve.lambda-url.us-east-1.on.aws/api';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle direct responses (not wrapped)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================
// Health & System
// ============================================================

export async function fetchHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

export async function fetchConfig() {
  const response = await apiClient.get('/config');
  return response.data;
}

// ============================================================
// Dashboard
// ============================================================

export async function fetchDashboard() {
  const response = await apiClient.get('/dashboard');
  return response.data;
}

// ============================================================
// Security
// ============================================================

export async function fetchSecurityFindings(params?: { severity?: string; status?: string; limit?: number }) {
  const response = await apiClient.get('/security/findings', { params });
  return response.data;
}

export async function fetchSecurityHubFindings(limit: number = 100) {
  const response = await apiClient.get('/security/security-hub', { params: { limit } });
  return response.data;
}

export async function fetchGuardDutyFindings(limit: number = 50) {
  const response = await apiClient.get('/security/guardduty', { params: { limit } });
  return response.data;
}

export async function fetchConfigRules() {
  const response = await apiClient.get('/security/config');
  return response.data;
}

export async function fetchInspectorFindings() {
  const response = await apiClient.get('/security/inspector');
  return response.data;
}

// ============================================================
// Compliance
// ============================================================

export async function fetchComplianceScore() {
  const response = await apiClient.get('/compliance/score');
  return response.data;
}

export async function fetchUnifiedCompliance() {
  const response = await apiClient.get('/compliance/unified');
  return response.data;
}

export async function fetchComplianceFrameworks() {
  const response = await apiClient.get('/compliance/frameworks');
  return response.data;
}

export async function fetchComplianceHistory(days: number = 30) {
  const response = await apiClient.get('/compliance/history', { params: { days } });
  return response.data;
}

// ============================================================
// Vulnerabilities
// ============================================================

export async function fetchVulnerabilitiesOverview() {
  const response = await apiClient.get('/vulnerabilities/overview');
  return response.data;
}

export async function fetchInspectorVulnerabilities() {
  const response = await apiClient.get('/vulnerabilities/inspector');
  return response.data;
}

export async function fetchEKSVulnerabilities() {
  const response = await apiClient.get('/vulnerabilities/eks');
  return response.data;
}

export async function fetchContainerVulnerabilities() {
  const response = await apiClient.get('/vulnerabilities/containers');
  return response.data;
}

// ============================================================
// Guardrails
// ============================================================

export async function fetchSCPPolicies() {
  const response = await apiClient.get('/guardrails/scp');
  return response.data;
}

export async function fetchOPAPolicies() {
  const response = await apiClient.get('/guardrails/opa');
  return response.data;
}

export async function fetchKICSResults() {
  const response = await apiClient.get('/guardrails/kics');
  return response.data;
}

export async function fetchGuardrailViolations() {
  const response = await apiClient.get('/guardrails/violations');
  return response.data;
}

export async function deployGuardrail(request: {
  policy_type: string;
  policy_id: string;
  target_accounts: string[];
  dry_run: boolean;
}) {
  const response = await apiClient.post('/guardrails/deploy', request);
  return response.data;
}

// ============================================================
// Remediation
// ============================================================

export async function fetchThreats() {
  const response = await apiClient.get('/remediation/threats');
  return response.data;
}

export async function generateRemediationCode(request: {
  finding_id: string;
  finding_type: string;
  resource_type: string;
  resource_id: string;
  language: string;
  description?: string;
}) {
  const response = await apiClient.post('/remediation/generate-code', request);
  return response.data;
}

export async function executeBatchRemediation(request: {
  finding_ids: string[];
  action: string;
  approval_required: boolean;
  notify: boolean;
}) {
  const response = await apiClient.post('/remediation/batch', request);
  return response.data;
}

export async function fetchRemediationHistory(limit: number = 50) {
  const response = await apiClient.get('/remediation/history', { params: { limit } });
  return response.data;
}

export async function rollbackRemediation(remediationId: string) {
  const response = await apiClient.post('/remediation/rollback', { remediation_id: remediationId });
  return response.data;
}

// ============================================================
// Accounts
// ============================================================

export async function fetchAccounts(params?: { environment?: string; status?: string; limit?: number }) {
  const response = await apiClient.get('/accounts', { params });
  return response.data;
}

export async function fetchAccountTemplates() {
  const response = await apiClient.get('/accounts/templates');
  return response.data;
}

export async function fetchAccountDetails(accountId: string) {
  const response = await apiClient.get(`/accounts/${accountId}`);
  return response.data;
}

export async function provisionAccount(request: {
  account_name: string;
  email: string;
  template: string;
  environment: string;
  cost_center?: string;
  owner?: string;
}) {
  const response = await apiClient.post('/accounts/provision', request);
  return response.data;
}

export async function decommissionAccount(accountId: string) {
  const response = await apiClient.post('/accounts/decommission', { account_id: accountId });
  return response.data;
}

// ============================================================
// FinOps
// ============================================================

export async function fetchFinOpsOverview() {
  const response = await apiClient.get('/finops/overview');
  return response.data;
}

export async function fetchCostByService() {
  const response = await apiClient.get('/finops/by-service');
  return response.data;
}

export async function fetchCostByAccount() {
  const response = await apiClient.get('/finops/by-account');
  return response.data;
}

export async function fetchBudgets() {
  const response = await apiClient.get('/finops/budgets');
  return response.data;
}

export async function fetchCostAnomalies() {
  const response = await apiClient.get('/finops/anomalies');
  return response.data;
}

export async function fetchSavingsRecommendations() {
  const response = await apiClient.get('/finops/savings');
  return response.data;
}

export async function fetchUnitEconomics() {
  const response = await apiClient.get('/finops/unit-economics');
  return response.data;
}

export async function fetchSustainability() {
  const response = await apiClient.get('/finops/sustainability');
  return response.data;
}

// ============================================================
// AI
// ============================================================

export async function sendAIChat(messages: { role: string; content: string }[], context?: string) {
  const response = await apiClient.post('/ai/chat', { messages, context });
  return response.data;
}

export async function fetchExecutiveDashboard() {
  const response = await apiClient.get('/ai/executive-dashboard');
  return response.data;
}

export async function fetchAIPrediction(type: 'cost' | 'security' | 'compliance' | 'operations') {
  const response = await apiClient.get(`/ai/predictions/${type}`);
  return response.data;
}

export async function fetchProactiveAlerts() {
  const response = await apiClient.get('/ai/alerts');
  return response.data;
}

// ============================================================
// Integrations
// ============================================================

export async function createJiraTicket(payload: any) {
  const response = await apiClient.post('/integrations/jira', { type: 'jira', payload });
  return response.data;
}

export async function sendSlackNotification(payload: any) {
  const response = await apiClient.post('/integrations/slack', { type: 'slack', payload });
  return response.data;
}

export async function createServiceNowIncident(payload: any) {
  const response = await apiClient.post('/integrations/servicenow', { type: 'servicenow', payload });
  return response.data;
}

export async function triggerPagerDuty(payload: any) {
  const response = await apiClient.post('/integrations/pagerduty', { type: 'pagerduty', payload });
  return response.data;
}

export async function fetchGitHubSecurity() {
  const response = await apiClient.get('/integrations/github');
  return response.data;
}

// ============================================================
// Export
// ============================================================

export default apiClient;
