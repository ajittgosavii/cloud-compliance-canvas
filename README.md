# Cloud Compliance Canvas v4.0.0

Enterprise AWS Governance Platform with AWS Organizations Support

## Features

### Demo/Live Mode Toggle
- **Demo Mode**: Shows realistic sample data for evaluation and demos
- **Live Mode**: Connects to real AWS services via Organizations

### AWS Organizations Integration
- List all accounts in your organization
- View account details, compliance scores, and costs
- Provision new accounts with templates
- Decommission accounts

### 10 Complete Modules
1. **Dashboard** - Unified overview
2. **AI Command Center** - Claude AI predictions and chat
3. **Security** - Security Hub, GuardDuty, Config, Inspector
4. **Compliance** - Multi-framework compliance tracking
5. **Vulnerabilities** - CVE tracking across services
6. **Tech Guardrails** - SCP, OPA, KICS policies
7. **Remediation** - AI-powered threat remediation
8. **Account Lifecycle** - AWS Organizations management
9. **FinOps** - Cost management and optimization
10. **Integrations** - Jira, Slack, ServiceNow, PagerDuty

## Quick Start

### Local Development
```bash
npm install
npm run dev
```

### Deploy to AWS Amplify
1. Push to GitHub
2. Connect in AWS Amplify Console
3. Set environment variable: `VITE_API_URL`
4. Deploy

## Lambda Backend Configuration

Set these environment variables in your Lambda function:

```
DEMO_MODE=false                    # Set to false for live data
AWS_DEFAULT_REGION=us-east-1       # Your AWS region
ANTHROPIC_API_KEY=sk-ant-...       # For Claude AI features
CROSS_ACCOUNT_ROLE_ARN=arn:aws:iam::123456789012:role/OrganizationAccountAccessRole
```

### Required IAM Permissions

For AWS Organizations integration:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "organizations:ListAccounts",
        "organizations:DescribeOrganization",
        "organizations:ListOrganizationalUnitsForParent",
        "organizations:ListRoots"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "securityhub:GetFindings",
        "guardduty:ListDetectors",
        "guardduty:ListFindings",
        "guardduty:GetFindings",
        "config:DescribeComplianceByConfigRule",
        "ce:GetCostAndUsage",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Lambda API     │────▶│  AWS Services   │
│   (Amplify)     │     │  (FastAPI)      │     │  Organizations  │
└─────────────────┘     └─────────────────┘     │  Security Hub   │
                                                 │  GuardDuty      │
                                                 │  Cost Explorer  │
                                                 └─────────────────┘
```

## Version History

- **v4.0.0** - AWS Organizations support, Demo/Live toggle
- **v3.0.0** - Full Lambda backend, 10 modules
- **v2.0.0** - React migration from Streamlit
- **v1.0.0** - Original Streamlit app
