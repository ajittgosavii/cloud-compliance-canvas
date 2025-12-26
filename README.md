# Cloud Compliance Canvas

**Enterprise AWS Governance Platform** - React + FastAPI on AWS

![AWS](https://img.shields.io/badge/AWS-Amplify-orange?logo=amazonaws)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?logo=fastapi)

---

## 🚀 Quick Start

### Deploy to AWS (15 minutes)

```bash
# 1. Extract the project
unzip react-finops-app-complete.zip
cd react-finops-app

# 2. Configure AWS
aws configure  # Enter your credentials

# 3. Deploy everything
chmod +x infrastructure/scripts/deploy.sh
./infrastructure/scripts/deploy.sh
```

**Done!** Your app will be live at `https://main.xxxxx.amplifyapp.com`

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md) | **Start here!** Full step-by-step deployment |
| [AWS_AMPLIFY_DEPLOYMENT.md](AWS_AMPLIFY_DEPLOYMENT.md) | Frontend deployment details |
| [MIGRATION_STRATEGY.md](MIGRATION_STRATEGY.md) | Streamlit → React migration notes |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│      AWS Amplify          │   │      API Gateway              │
│   (React Frontend)        │   │   /api/* → Lambda             │
│                           │   └───────────────────────────────┘
│  • Dashboard              │                   │
│  • Security               │                   ▼
│  • Compliance             │   ┌───────────────────────────────┐
│  • FinOps                 │   │      AWS Lambda               │
│  • Guardrails             │   │   (FastAPI Backend)           │
│  • Remediation            │   │                               │
│  • Accounts               │   │  • boto3 → AWS APIs           │
│  • AI Predictions         │   │  • anthropic → Claude AI      │
└───────────────────────────┘   │  • pandas → Data processing   │
                                └───────────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
            ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
            │Security Hub │         │Cost Explorer│         │   Claude    │
            │ GuardDuty   │         │  Budgets    │         │     AI      │
            │ Inspector   │         │    CE       │         │             │
            └─────────────┘         └─────────────┘         └─────────────┘
```

---

## 📁 Project Structure

```
react-finops-app/
├── src/                          # React Frontend
│   ├── pages/                    # 10 page components
│   ├── components/               # Reusable UI components
│   ├── stores/                   # Zustand state management
│   ├── services/                 # API client
│   └── types/                    # TypeScript definitions
│
├── infrastructure/               # AWS Infrastructure
│   ├── lambda/                   # FastAPI backend code
│   │   ├── app.py               # Main API application
│   │   └── requirements.txt     # Python dependencies
│   ├── cloudformation/          # Full stack CloudFormation
│   ├── scripts/                 # Deployment scripts
│   ├── template.yaml            # SAM template
│   └── samconfig.toml           # SAM configuration
│
├── amplify.yml                   # Amplify build settings
├── package.json                  # npm dependencies
├── vite.config.ts               # Vite configuration
└── COMPLETE_DEPLOYMENT_GUIDE.md # Deployment instructions
```

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Dashboard** | ✅ | Executive overview with KPIs |
| **Security** | ✅ | Security Hub, GuardDuty, Inspector |
| **Compliance** | ✅ | SOC 2, PCI-DSS, HIPAA, GDPR, ISO 27001 |
| **FinOps** | ✅ | Cost analysis, budgets, savings |
| **Guardrails** | ✅ | SCP, OPA, KICS policies |
| **Remediation** | ✅ | Auto-generated fix scripts |
| **Accounts** | ✅ | Multi-account management |
| **AI Predictions** | ✅ | Claude-powered insights |
| **Azure AD SSO** | ✅ | Enterprise authentication |
| **Demo Mode** | ✅ | Works without AWS connection |

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start React dev server
npm run dev

# Start FastAPI backend (in another terminal)
cd infrastructure/lambda
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# Open http://localhost:5173
```

---

## 📦 Deployment Commands

```bash
# Deploy backend only
npm run deploy:backend

# Deploy everything (backend + frontend)
npm run deploy:all

# Build frontend
npm run build

# Run tests
npm test
```

---

## 🔐 Azure AD SSO Setup

See [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md#4-azure-ad-sso-configuration) for:
1. Azure AD App Registration
2. AWS Cognito User Pool
3. Identity Provider Federation

---

## 💰 Cost Estimate

| Service | Free Tier | Est. Monthly Cost |
|---------|-----------|-------------------|
| Amplify Hosting | 15 GB/month | $0-5 |
| Lambda | 1M requests | $0-2 |
| API Gateway | 1M requests | $0-3 |
| Cognito | 50K MAU | $0 |
| **Total** | **Most covered** | **$0-10/month** |

---

## 🤝 Support

- **Issues:** Open a GitHub issue
- **Documentation:** See guides above
- **AWS Support:** Contact your TAM

---

## 📄 License

MIT License - See LICENSE file

---

*Cloud Compliance Canvas v1.0 | December 2025*
