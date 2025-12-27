import axios, { AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://72lbusissjfm3mm2fjplcst3gm0tgkve.lambda-url.us-east-1.on.aws/api';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// Health & Config (3 endpoints)
// ============================================================

export async function fetchHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

export async function fetchConfig() {
  const response = await apiClient.get('/config');
  return response.data;
}

export async function setDemoMode(demoMode: boolean) {
  const response = await apiClient.post('/config/mode', { demo_mode: demoMode });
  return response.data;
}

// ============================================================
// Dashboard (1 endpoint)
// ============================================================

export async function fetchDashboard() {
  const response = await apiClient.get('/dashboard');
  return response.data;
}

// ============================================================
// Accounts (7 endpoints)
// ============================================================

export async function fetchAccounts() {
  const response = await apiClient.get('/accounts');
  return response.data;
}

export async function fetchAccountTemplates() {
  const response = await apiClient.get('/accounts/templates');
  return response.data;
}

export async function provisionAccount(request: {
  account_name: string;
  template_id: string;
  portfolio?: string;
  compliance_frameworks?: string[];
  enable_services?: string[];
}) {
  const response = await apiClient.post('/accounts/provision', request);
  return response.data;
}

export async function offboardAccount(request: {
  account_id: string;
  reason?: string;
  data_retention_days?: number;
}) {
  const response = await apiClient.post('/accounts/offboard', request);
  return response.data;
}

export async function fetchAccountApprovals() {
  const response = await apiClient.get('/accounts/approvals');
  return response.data;
}

export async function approveAccountRequest(requestId: string) {
  const response = await apiClient.post('/accounts/approve', { request_id: requestId });
  return response.data;
}

export async function rejectAccountRequest(requestId: string, reason: string) {
  const response = await apiClient.post('/accounts/reject', { request_id: requestId, reason });
  return response.data;
}

// ============================================================
// FinOps (14 endpoints)
// ============================================================

export async function fetchFinOpsOverview() {
  const response = await apiClient.get('/finops/overview');
  return response.data;
}

export async function fetchAIMLCosts() {
  const response = await apiClient.get('/finops/aiml-costs');
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

export async function fetchBudgets() {
  const response = await apiClient.get('/finops/budgets');
  return response.data;
}

export async function fetchCostByAccount() {
  const response = await apiClient.get('/finops/by-account');
  return response.data;
}

export async function fetchCostForecast() {
  const response = await apiClient.get('/finops/forecast');
  return response.data;
}

export async function fetchComputeOptimizer() {
  const response = await apiClient.get('/finops/compute-optimizer');
  return response.data;
}

export async function fetchWasteDetection() {
  const response = await apiClient.get('/finops/waste');
  return response.data;
}

export async function fetchTrustedAdvisor() {
  const response = await apiClient.get('/finops/trusted-advisor');
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

export async function fetchChargeback() {
  const response = await apiClient.get('/finops/chargeback');
  return response.data;
}

export async function fetchDataPipelines() {
  const response = await apiClient.get('/finops/data-pipelines');
  return response.data;
}

// ============================================================
// Security (6 endpoints)
// ============================================================

export async function fetchSecurityFindings() {
  const response = await apiClient.get('/security/findings');
  return response.data;
}

export async function fetchSecurityHub() {
  const response = await apiClient.get('/security/security-hub');
  return response.data;
}

export async function fetchGuardDuty() {
  const response = await apiClient.get('/security/guardduty');
  return response.data;
}

export async function fetchConfigCompliance() {
  const response = await apiClient.get('/security/config');
  return response.data;
}

export async function fetchInspector() {
  const response = await apiClient.get('/security/inspector');
  return response.data;
}

export async function fetchSecurityTrends() {
  const response = await apiClient.get('/security/trends');
  return response.data;
}

// ============================================================
// Compliance (4 endpoints)
// ============================================================

export async function fetchComplianceScore() {
  const response = await apiClient.get('/compliance/score');
  return response.data;
}

export async function fetchComplianceFrameworks() {
  const response = await apiClient.get('/compliance/frameworks');
  return response.data;
}

export async function fetchComplianceUnified() {
  const response = await apiClient.get('/compliance/unified');
  return response.data;
}

export async function fetchComplianceControls() {
  const response = await apiClient.get('/compliance/controls');
  return response.data;
}

// ============================================================
// Vulnerabilities (6 endpoints)
// ============================================================

export async function fetchVulnerabilitiesOverview() {
  const response = await apiClient.get('/vulnerabilities/overview');
  return response.data;
}

export async function fetchVulnerabilitiesInspector() {
  const response = await apiClient.get('/vulnerabilities/inspector');
  return response.data;
}

export async function fetchVulnerabilitiesEKS() {
  const response = await apiClient.get('/vulnerabilities/eks');
  return response.data;
}

export async function fetchVulnerabilitiesContainers() {
  const response = await apiClient.get('/vulnerabilities/containers');
  return response.data;
}

export async function fetchVulnerabilitiesSnyk() {
  const response = await apiClient.get('/vulnerabilities/snyk');
  return response.data;
}

export async function fetchVulnerabilitiesTrivy() {
  const response = await apiClient.get('/vulnerabilities/trivy');
  return response.data;
}

// ============================================================
// Guardrails (11 endpoints)
// ============================================================

export async function fetchGuardrailsSCP() {
  const response = await apiClient.get('/guardrails/scp');
  return response.data;
}

export async function fetchGuardrailsOPA() {
  const response = await apiClient.get('/guardrails/opa');
  return response.data;
}

export async function fetchGuardrailsKICS() {
  const response = await apiClient.get('/guardrails/kics');
  return response.data;
}

export async function fetchGuardrailsViolations() {
  const response = await apiClient.get('/guardrails/violations');
  return response.data;
}

export async function deployGuardrail(policy: { policy_type: string; policy_content: string }) {
  const response = await apiClient.post('/guardrails/deploy', policy);
  return response.data;
}

export async function fetchGuardrailsGHAS() {
  const response = await apiClient.get('/guardrails/ghas');
  return response.data;
}

export async function fetchGuardrailsPRCompliance() {
  const response = await apiClient.get('/guardrails/pr-compliance');
  return response.data;
}

export async function fetchGuardrailsProbot() {
  const response = await apiClient.get('/guardrails/probot');
  return response.data;
}

export async function fetchGuardrailsAWSTools() {
  const response = await apiClient.get('/guardrails/aws-tools');
  return response.data;
}

export async function fetchGuardrailsFinOpsTools() {
  const response = await apiClient.get('/guardrails/finops-tools');
  return response.data;
}

export async function fetchGuardrailsAIAgents() {
  const response = await apiClient.get('/guardrails/ai-agents');
  return response.data;
}

// ============================================================
// Remediation (8 endpoints)
// ============================================================

export async function fetchRemediationThreats() {
  const response = await apiClient.get('/remediation/threats');
  return response.data;
}

export async function generateRemediationCode(request: {
  finding_id: string;
  finding_type: string;
  language?: string;
}) {
  const response = await apiClient.post('/remediation/generate-code', request);
  return response.data;
}

export async function executeBatchRemediation(request: {
  finding_ids: string[];
  approval_required?: boolean;
  options?: Record<string, any>;
}) {
  const response = await apiClient.post('/remediation/batch', request);
  return response.data;
}

export async function fetchRemediationHistory() {
  const response = await apiClient.get('/remediation/history');
  return response.data;
}

export async function fetchGitOpsStatus() {
  const response = await apiClient.get('/remediation/gitops/status');
  return response.data;
}

export async function fetchGitOpsDetection() {
  const response = await apiClient.get('/remediation/gitops/detection');
  return response.data;
}

export async function executeGitOpsRemediation(request: {
  drift_ids?: string[];
  auto_apply?: boolean;
}) {
  const response = await apiClient.post('/remediation/gitops/remediate', request);
  return response.data;
}

export async function createGitOpsPolicy(request: {
  policy_type: string;
  policy_content: string;
  description?: string;
}) {
  const response = await apiClient.post('/remediation/gitops/policy', request);
  return response.data;
}

// ============================================================
// AI / Claude (5 endpoints)
// ============================================================

export async function fetchAIExecutiveDashboard() {
  const response = await apiClient.get('/ai/executive-dashboard');
  return response.data;
}

export async function fetchAIPrediction(type: 'cost' | 'security' | 'compliance' | 'capacity' | 'operations') {
  const response = await apiClient.get(`/ai/predictions/${type}`);
  return response.data;
}

export async function fetchAIAlerts() {
  const response = await apiClient.get('/ai/alerts');
  return response.data;
}

export async function sendAIChat(messages: { role: string; content: string }[], context?: string) {
  const response = await apiClient.post('/ai/chat', { messages, context });
  return response.data;
}

// ============================================================
// Integrations (9 endpoints)
// ============================================================

export async function createJiraTicket(request: {
  title: string;
  description: string;
  priority?: string;
  finding_id?: string;
}) {
  const response = await apiClient.post('/integrations/jira', request);
  return response.data;
}

export async function sendSlackMessage(request: {
  channel: string;
  message: string;
  blocks?: any[];
}) {
  const response = await apiClient.post('/integrations/slack', request);
  return response.data;
}

export async function createServiceNowIncident(request: {
  title: string;
  description: string;
  severity?: string;
}) {
  const response = await apiClient.post('/integrations/servicenow', request);
  return response.data;
}

export async function triggerPagerDuty(request: {
  title: string;
  severity: string;
  details?: any;
}) {
  const response = await apiClient.post('/integrations/pagerduty', request);
  return response.data;
}

export async function fetchGitHubAlerts() {
  const response = await apiClient.get('/integrations/github');
  return response.data;
}

export async function fetchSnowflakeStatus() {
  const response = await apiClient.get('/integrations/snowflake');
  return response.data;
}

export async function fetchCloudabilityData() {
  const response = await apiClient.get('/integrations/cloudability');
  return response.data;
}

export async function sendEmailNotification(request: {
  recipients: string[];
  subject: string;
  body?: string;
}) {
  const response = await apiClient.post('/integrations/email', request);
  return response.data;
}

export async function sendTeamsMessage(request: {
  channel: string;
  message: string;
  mentions?: string[];
}) {
  const response = await apiClient.post('/integrations/teams', request);
  return response.data;
}

// ============================================================
// Export default client for custom requests
// ============================================================

export default apiClient;
