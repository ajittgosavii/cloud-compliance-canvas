# Cloud Compliance Canvas - React Frontend v3.0.0

A modern React dashboard for AWS cloud governance, security, compliance, and cost management.

## Features

### 10 Complete Modules

1. **Dashboard** - Unified overview of all metrics
2. **AI Command Center** - Claude AI-powered predictions, chat, and alerts
3. **Security** - Security Hub, GuardDuty, Config Rules, Inspector
4. **Compliance** - Unified multi-source compliance monitoring
5. **Vulnerabilities** - Inspector, EKS, and Container vulnerabilities
6. **Tech Guardrails** - SCP, OPA, and KICS policy management
7. **Remediation** - AI-powered threat analysis and code generation
8. **Account Lifecycle** - AWS account provisioning and management
9. **FinOps** - Cost management, budgets, anomalies, savings
10. **Integrations** - Jira, Slack, ServiceNow, PagerDuty, GitHub

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to AWS Amplify

1. Push code to GitHub/GitLab/CodeCommit
2. Connect repository in AWS Amplify Console
3. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
4. Add environment variable:
   - `VITE_API_URL`: Your Lambda Function URL

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | Lambda Function URL |

### API Endpoints

The frontend connects to a Lambda backend with 50+ endpoints:

- `/api/dashboard` - Dashboard overview
- `/api/ai/*` - AI predictions and chat
- `/api/security/*` - Security findings
- `/api/compliance/*` - Compliance data
- `/api/vulnerabilities/*` - Vulnerability management
- `/api/guardrails/*` - Policy management
- `/api/remediation/*` - Threat remediation
- `/api/accounts/*` - Account lifecycle
- `/api/finops/*` - Cost management
- `/api/integrations/*` - External integrations

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **Axios** - HTTP client

## Project Structure

```
src/
├── App.tsx              # Main app with navigation
├── main.tsx            # Entry point
├── index.css           # Global styles
├── services/
│   └── api.ts          # API client with all endpoints
└── pages/
    ├── DashboardPage.tsx
    ├── AIPredictionsPage.tsx
    ├── SecurityPage.tsx
    ├── CompliancePage.tsx
    ├── VulnerabilitiesPage.tsx
    ├── GuardrailsPage.tsx
    ├── RemediationPage.tsx
    ├── AccountsPage.tsx
    ├── FinOpsPage.tsx
    └── IntegrationsPage.tsx
```

## Screenshots

### Dashboard
Overview of security findings, compliance score, costs, and account status.

### AI Command Center
Chat with Claude AI, view predictions, and receive proactive alerts.

### FinOps
Complete cost management with budgets, anomalies, and savings recommendations.

## License

MIT

## Support

For issues and feature requests, please open a GitHub issue.
