// AWS and Application Types for Cloud Compliance Canvas

// ============================================================
// Core Types
// ============================================================

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
}

export interface AppState {
  demoMode: boolean;
  awsConnected: boolean;
  authenticated: boolean;
  overallComplianceScore: number;
  claudeClient: any | null;
}

export type UserRole = 'admin' | 'cfo' | 'ciso' | 'cto' | 'analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  lastLogin: string;
}

// ============================================================
// Security & Compliance Types
// ============================================================

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: 'ACTIVE' | 'RESOLVED' | 'SUPPRESSED';
  accountId: string;
  accountName: string;
  region: string;
  resourceType: string;
  resourceId: string;
  complianceStatus: 'PASSED' | 'FAILED' | 'NOT_AVAILABLE';
  createdAt: string;
  updatedAt: string;
  remediation?: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  controlCount: number;
  passedControls: number;
  failedControls: number;
  score: number;
  lastAssessment: string;
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  title: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';
  severity: Severity;
  resources: number;
  findings: SecurityFinding[];
}

export interface SecurityHubData {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  totalFindings: number;
  passedChecks: number;
  failedChecks: number;
  findings: SecurityFinding[];
  complianceScore: number;
  enabledStandards: string[];
}

export interface GuardDutyFinding {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: number;
  region: string;
  accountId: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
  threatType: string;
  threatPurpose: string;
}

export interface InspectorFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: 'ACTIVE' | 'SUPPRESSED' | 'CLOSED';
  resourceType: string;
  resourceId: string;
  accountId: string;
  region: string;
  vulnerabilityId: string;
  cvss: number;
  exploitAvailable: boolean;
  fixAvailable: boolean;
  packageName?: string;
  packageVersion?: string;
  fixedVersion?: string;
}

// ============================================================
// FinOps Types
// ============================================================

export interface CostData {
  date: string;
  amount: number;
  currency: string;
  service?: string;
  account?: string;
  region?: string;
  tags?: Record<string, string>;
}

export interface CostOverview {
  currentMonthCost: number;
  previousMonthCost: number;
  forecastedMonthCost: number;
  monthOverMonthChange: number;
  yearToDateCost: number;
  budgetAmount: number;
  budgetUsedPercent: number;
  topServices: ServiceCost[];
  topAccounts: AccountCost[];
  dailyCosts: CostData[];
}

export interface ServiceCost {
  serviceName: string;
  cost: number;
  percentage: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AccountCost {
  accountId: string;
  accountName: string;
  cost: number;
  percentage: number;
  change: number;
  environment: 'production' | 'staging' | 'development' | 'sandbox';
}

export interface SavingsRecommendation {
  id: string;
  type: 'SAVINGS_PLAN' | 'RESERVED_INSTANCE' | 'RIGHTSIZING' | 'IDLE_RESOURCE';
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  resourceId?: string;
  resourceType?: string;
  currentCost: number;
  recommendedCost: number;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  actionUrl?: string;
}

export interface CostAnomaly {
  id: string;
  accountId: string;
  service: string;
  region: string;
  expectedCost: number;
  actualCost: number;
  impact: number;
  impactPercentage: number;
  startDate: string;
  endDate?: string;
  status: 'ONGOING' | 'RESOLVED';
  rootCause?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  actualSpend: number;
  forecastedSpend: number;
  percentUsed: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  alertThresholds: number[];
  alertsTriggered: number;
  startDate: string;
  endDate: string;
}

// ============================================================
// Guardrails & Policy Types
// ============================================================

export interface SCPPolicy {
  id: string;
  name: string;
  description: string;
  type: 'SERVICE_CONTROL_POLICY';
  content: string;
  targets: string[];
  status: 'ATTACHED' | 'DETACHED';
  createdAt: string;
  updatedAt: string;
}

export interface OPAPolicy {
  id: string;
  name: string;
  description: string;
  policyType: 'KUBERNETES' | 'TERRAFORM' | 'AWS' | 'DOCKER';
  regoCode: string;
  status: 'ACTIVE' | 'INACTIVE';
  violations: number;
  lastEvaluated: string;
  violationDetails?: OPAViolation[];
}

export interface OPAViolation {
  resource: string;
  issue: string;
  severity: Severity;
  timestamp: string;
}

export interface KICSFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  repository: string;
  filePath: string;
  lineNumber: number;
  resource: string;
  codeSnippet: string;
  remediation: string;
  cwe: string;
  timestamp: string;
}

// ============================================================
// Account Lifecycle Types
// ============================================================

export interface AWSAccount {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_CLOSURE';
  joinedMethod: 'CREATED' | 'INVITED';
  joinedTimestamp: string;
  organizationalUnit: string;
  environment: 'production' | 'staging' | 'development' | 'sandbox';
  owner: string;
  costCenter: string;
  tags: Record<string, string>;
}

export interface AccountTemplate {
  id: string;
  name: string;
  description: string;
  environment: 'production' | 'staging' | 'development' | 'sandbox';
  features: string[];
  scps: string[];
  stackSets: string[];
  defaultTags: Record<string, string>;
}

export interface ProvisioningRequest {
  id: string;
  templateId: string;
  accountName: string;
  requestor: string;
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  steps: ProvisioningStep[];
}

export interface ProvisioningStep {
  id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  message?: string;
  startedAt?: string;
  completedAt?: string;
}

// ============================================================
// Remediation Types
// ============================================================

export interface RemediationAction {
  id: string;
  findingId: string;
  type: 'AUTOMATED' | 'MANUAL' | 'SEMI_AUTOMATED';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  title: string;
  description: string;
  script?: string;
  scriptLanguage?: 'PYTHON' | 'POWERSHELL' | 'BASH' | 'TERRAFORM';
  executedBy?: string;
  executedAt?: string;
  completedAt?: string;
  rollbackScript?: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RemediationPlan {
  id: string;
  name: string;
  description: string;
  findings: string[];
  actions: RemediationAction[];
  status: 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  totalEstimatedTime: number;
  completedActions: number;
}

// ============================================================
// AI & Predictions Types
// ============================================================

export interface AIPrediction {
  id: string;
  type: 'COST' | 'SECURITY' | 'COMPLIANCE' | 'CAPACITY' | 'OPERATIONAL';
  title: string;
  description: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  dataPoints: DataPoint[];
  generatedAt: string;
}

export interface DataPoint {
  date: string;
  actual?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface ProactiveAlert {
  id: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  recommendation: string;
  affectedResources: string[];
  estimatedImpact: string;
  deadline?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'stable';
  changeLabel?: string;
  icon?: string;
  color?: string;
}

export interface ServiceStatus {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  lastCheck: string;
  message?: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
